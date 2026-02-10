import {WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import { Logger } from '@nestjs/common';
import { AttendanceDto } from './attendance.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class AttendanceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(AttendanceGateway.name);
  @WebSocketServer() server: Server;

  handleConnection(client: Socket): any {
    this.logger.log(`Client Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): any {
    this.logger.log(`Client Disconnected ${client.id}`);
  }

  broadcastAttendance(attendance: any) {
    this.logger.log(`Broadcasting Attendance Update: ${JSON.stringify(attendance)}`);
    this.server.emit('attendanceUpdate', attendance);
  }
}