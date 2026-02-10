import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from '../member/member.schema';
import { Model } from 'mongoose';
import { Attendance } from '../attendance/attendance.schema';
import { Payment } from '../payment/payment.schema';
import { MembersService } from '../member/members.service';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Member.name) private memberModel: Model<Member>,
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    private readonly memberService: MembersService,
    private readonly paymentService: PaymentService,
  ) {}

  async getStats(): Promise<any> {
    const today = new Date();
    today.setHours(0,0,0,0);
    const t = new Date(today);
    t.setDate(t.getDate() + 1);

    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    // Fetch the Attendance Growth in current month and previus month
    const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1);

    // daily visit
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalMembers,
      activeMembers,
      todayAttendance,
      thisMonthRevenue,
      currentMonthAttendance,
      previousMonthAttendance,
      previousMonthRevenue,
      dailyVisits,
    ] = await Promise.all([
      this.memberModel.countDocuments(),
      this.memberModel.countDocuments({activeStatus: true}),
      this.attendanceModel.countDocuments({ date: { $gte: today, $lt: t} }),
      this.paymentModel.aggregate([
        {$match: {paymentDate: {$gte: firstOfMonth}}},
        {$group: {_id: null, total: {$sum: '$amount'}}},
      ]),
      this.attendanceModel.countDocuments({ date: { $gte: firstOfMonth } }),
      this.attendanceModel.countDocuments({ date: { $gte: previousMonthStart, $lt: previousMonthEnd } }),
      this.paymentModel.aggregate([
        { $match: { paymentDate: { $gte: previousMonthStart, $lt: previousMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.attendanceModel.aggregate([
        { $match: { date: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, count: { $sum: 1 } } },
      ]),
    ]);

    const monthlyRevenue = thisMonthRevenue[0]?.total || 0;
    const attendanceGrowth = previousMonthAttendance > 0
      ? ((currentMonthAttendance - previousMonthAttendance) / previousMonthAttendance) * 100
      : 0;

    // Getting the Revenue
    const prevRevenue = previousMonthRevenue[0]?.total || 0;
    const revenueGrowth = prevRevenue > 0
      ? ((monthlyRevenue - prevRevenue) / prevRevenue) * 100
      : 0;

    const averageDailyVisits = dailyVisits.length > 0
      ? dailyVisits.reduce((sum, day) => sum + day.count, 0) / dailyVisits.length
      : 0;

    return {
      totalMembers,
      activeMembers,
      todayAttendance,
      thisMonthRevenue: monthlyRevenue,
      attendanceGrowth: attendanceGrowth.toFixed(1),
      revenueGrowth: revenueGrowth.toFixed(1),
      averageDailyVisits: Math.round(averageDailyVisits),
    };
  }

  async getRevenueData(filter: 'week' | 'month' | 'year'): Promise<any[]> {
    const today = new Date();
    let startDate = new Date();
    let groupBy = '';
    let labelFormat = (date: string, index: number) => date;

    if (filter === 'week') {
      startDate.setDate(startDate.getDate() - 6); // Last 7 days including today
      groupBy = '%Y-%m-%d';
      labelFormat = (date: string) => {
        const day = new Date(date).toLocaleString('en-US', { weekday: 'short' });
        return day;
      };
    } else if (filter === 'month') {
      startDate.setDate(1);
      groupBy = '%Y-%U';
      labelFormat = (week: string, index: number) => `Week ${index + 1}`;
    } else if (filter === 'year') {
      startDate = new Date(today.getFullYear(), 0, 1);
      groupBy = '%Y-%m';
      labelFormat = (month: string) => new Date(month + '-01').toLocaleString('en-US', { month: 'short' });
    }

    const data = await this.paymentModel.aggregate([
      { $match: { paymentDate: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: groupBy, date: '$paymentDate' } },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return data.map((item, index) => ({ label: labelFormat(item._id, index), revenue: item.revenue }));
  }

  async getAttendanceData(filter: 'week' | 'month' | 'year'): Promise<any[]> {
    const today = new Date();
    let startDate = new Date();
    let groupBy = '';
    let labelFormat = (date: string, index: number) => date;

    if (filter === 'week') {
      startDate.setDate(startDate.getDate() - 6); // Last 7 days including today
      groupBy = '%Y-%m-%d';
      labelFormat = (date: string) => {
        const day = new Date(date).toLocaleString('en-US', { weekday: 'short' });
        return day;
      };
    } else if (filter === 'month') {
      startDate.setDate(1);
      groupBy = '%Y-%U';
      labelFormat = (week: string, index: number) => `Week ${index + 1}`;
    } else if (filter === 'year') {
      startDate = new Date(today.getFullYear(), 0, 1);
      groupBy = '%Y-%m';
      labelFormat = (month: string) => new Date(month + '-01').toLocaleString('en-US', { month: 'short' });
    }

    const data = await this.attendanceModel.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: groupBy, date: '$date' } },
          members: { $addToSet: '$member' },
        },
      },
      {
        $project: {
          _id: 1,
          members: { $size: '$members' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return data.map((item, index) => ({ label: labelFormat(item._id, index), members: item.members }));
  }
}
