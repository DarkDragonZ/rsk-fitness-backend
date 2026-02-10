import { performance } from 'node:perf_hooks';
import { ReportsService } from '../../src/report/reports.service';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const delayMs = Number(process.env.PERF_DB_DELAY_MS ?? 25);

const memberModel = {
  countDocuments: async (filter?: Record<string, unknown>) => {
    await delay(delayMs);
    return filter && filter.activeStatus ? 60 : 120;
  },
};

const attendanceModel = {
  countDocuments: async () => {
    await delay(delayMs);
    return 15;
  },
  aggregate: async () => {
    await delay(delayMs);
    return [
      { _id: '2026-02-01', count: 8 },
      { _id: '2026-02-02', count: 12 },
    ];
  },
};

const paymentModel = {
  aggregate: async () => {
    await delay(delayMs);
    return [{ _id: null, total: 2400 }];
  },
};

async function run() {
  const reportsService = new ReportsService(
    memberModel as any,
    attendanceModel as any,
    paymentModel as any,
    {} as any,
    {} as any,
  );

  const start = performance.now();
  const stats = await reportsService.getStats();
  const duration = performance.now() - start;

  console.log('getStats duration (ms):', Math.round(duration));
  console.log('sample output:', stats);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
