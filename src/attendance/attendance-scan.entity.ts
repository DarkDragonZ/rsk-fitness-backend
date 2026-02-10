// import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// @Entity('attendance_scans') // Table name in PostgreSQL
// export class AttendanceScan {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column({ type: 'text', collation: 'pg_catalog.default' }) // Fixed collation syntax
//   employeeid: string;

//   @Column({ type: 'timestamptz' }) // 'timestamptz' for timestamp with time zone
//   datetime: Date;

//   @Column({ type: 'date' })
//   date: Date;

//   @Column({ type: 'timetz' }) // 'timetz' for time with time zone
//   time: Date;

//   @Column({ type: 'text', collation: 'pg_catalog.default' }) // Fixed collation syntax
//   authresult: string;

//   @Column({ type: 'text', collation: 'pg_catalog.default' }) // Fixed collation syntax
//   firstname: string;

//   @Column({ type: 'text', collation: 'pg_catalog.default' }) // Fixed collation syntax
//   lastname: string;

//   @Column({ type: 'text', collation: 'pg_catalog.default' }) // Fixed collation syntax
//   authtype: string;

//   @Column({ type: 'text', collation: 'pg_catalog.default' }) // Fixed collation syntax
//   devicename: string;

//   @Column({ type: 'text', collation: 'pg_catalog.default' }) // Fixed collation syntax
//   deviceno: string;

//   @Column({ type: 'text', collation: 'pg_catalog.default' }) // Fixed collation syntax
//   readername: string;

//   @Column({ type: 'text', collation: 'pg_catalog.default' }) // Fixed collation syntax
//   personname: string;

//   @Column({ type: 'text', collation: 'pg_catalog.default' }) // Fixed collation syntax
//   persongroup: string;

//   @Column({ type: 'text', collation: 'pg_catalog.default' }) // Fixed collation syntax
//   cardno: string;

//   @Column({ type: 'text', collation: 'pg_catalog.default' }) // Fixed collation syntax
//   direction: string;

//   @Column({ type: 'text', collation: 'pg_catalog.default' }) // Fixed collation syntax
//   temperature: string;

//   @Column({ type: 'text', collation: 'pg_catalog.default' }) // Fixed collation syntax
//   tempstatus: string;

//   @Column({ type: 'text', collation: 'pg_catalog.default' }) // Fixed collation syntax
//   mask: string;

//   @Column({ type: 'text', collation: 'pg_catalog.default' }) // Fixed collation syntax
//   attstatus: string;

//   @Column({ type: 'boolean', default: false })
//   processed: boolean;

//   @Column({ type: 'text', collation: 'pg_catalog.default' }) // Fixed collation syntax
//   nicnumber: string; // Retain the original field, updated to text

//   @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
//   scantime: Date;
// }