import type { Carrier } from '../types';

/**
 * Life / annuity carriers appointed through GA AMG/IDA (AMGDA), with commission
 * pay schedules. Source of truth for seeding into Supabase via
 * `ops/seed-amg-ida-carriers.ts`. Existing directory ids are reused where a
 * matching life carrier already exists.
 */
export const AMG_IDA_GA = 'AMG/IDA';

type PayScheduleCarrier = {
  id: string;
  name: string;
  /** Short card summary shown as Base Commission / pay cadence. */
  summary: string;
  /** Full pay-schedule prose. */
  paySchedule: string;
  linesOfBusiness?: string[];
  segment?: string[];
  agencyCode?: string;
  /** Extra incentives notes (contacts, special programs). */
  notes?: string;
  /** When true, seed updates only GA + incentives on an existing row. */
  existing?: boolean;
};

export const AMG_IDA_PAY_SCHEDULE_CARRIERS: PayScheduleCarrier[] = [
  {
    id: 'cica-life',
    name: 'CICA Life',
    summary: 'Monthly on the 10th · $10 min',
    paySchedule:
      'Commissions are paid once a month, on the 10th, for the previous month’s policies with a $10 minimum.',
    linesOfBusiness: ['Life - Final Expense / Superior Choice'],
  },
  {
    id: 'accordia',
    name: 'Accordia',
    summary: 'Checks EOM · EFT Fri→Tue · $25 min',
    paySchedule:
      'Checks are mailed at the end of each month. The cut-off for EFT is every Friday, with deposits made the following Tuesday. $25 minimum applies to both payment methods.',
  },
  {
    id: 'aetna-american-equity',
    name: 'Aetna / American Equity',
    summary: 'EFT every Friday · cutoffs Wed/Sat',
    paySchedule:
      'EFTs are deposited every Friday, with cut-offs on Wednesday and Saturday each week.',
  },
  {
    id: 'allianz-life',
    name: 'Allianz',
    summary: 'Checks Tue ($250) · EFT daily (Fri cutoff)',
    paySchedule:
      'Checks are mailed on Tuesdays with a $250 minimum. EFTs are deposited daily, with a weekly cut-off on Fridays.',
  },
  {
    id: 'american-general-life-aig-corebridge',
    name: 'American General Life / AIG / Corebridge',
    summary: 'Checks bi-weekly Fri · EFT weekly Thu · $50 min',
    paySchedule:
      'Checks are mailed every two weeks on Fridays. New agents are paid by EFT only, with deposits made weekly on Thursdays. There is a $50 minimum and a Friday cut-off. For commission questions or statements, email Corebridge commissions at imobgacomp@corebridgefinancial.com.',
    linesOfBusiness: ['Appointed'],
    notes: 'Commission questions/statements: imobgacomp@corebridgefinancial.com',
    existing: true,
  },
  {
    id: 'american-general-annuities',
    name: 'American General (Annuities)',
    summary: 'As-earned next-day from 1/13/2025',
    paySchedule:
      'For commissions earned from 1/6/2024 to 1/10/2025, payments and statements follow the prior process and were released on Monday, January 13, 2025 (timing of receipt depends on the agent’s bank). Starting 1/13/2025, commissions are paid and statements released the next day, based on the agent’s bank processing times.',
    linesOfBusiness: ['Annuities'],
  },
  {
    id: 'american-national',
    name: 'American National',
    summary: 'EFT/checks every Tuesday · $50 min · Fri cutoff',
    paySchedule:
      'EFTs and checks are issued every Tuesday with a $50 minimum. The cut-off is Friday.',
  },
  {
    id: 'ameritas',
    name: 'Ameritas',
    summary: '15th & 30th · EFT +3 days · no minimum',
    paySchedule:
      'EFTs are deposited 3 days after the cycle closes on the 15th and 30th. Checks are mailed on the 15th and 30th. No minimum required.',
  },
  {
    id: 'athene-annuity',
    name: 'Athene Annuity',
    summary: 'Checks EOM · EFT weekly · $50 min',
    paySchedule:
      'Checks are mailed at the end of each month with a $50 minimum. EFTs are deposited weekly with the same minimum.',
    linesOfBusiness: ['Annuities'],
  },
  {
    id: 'axa-equitable',
    name: 'AXA Equitable',
    summary: 'Checks Thu next week · EFT Fri next week · $250 renewal min',
    paySchedule:
      'Checks are mailed on Thursday of the following week with a $250 minimum for renewal. The weekly cut-off is Thursday. EFT payments are deposited on Friday of the following week, also with a $250 minimum for renewal.',
  },
  {
    id: 'banner-life-legal-general-america',
    name: 'Banner Life / Legal & General America',
    summary: 'Weekly default · EFT +1 business day · $50 min',
    paySchedule:
      'Direct deposit is preferred. Checks are sent to AMG’s home office, then forwarded to the agent. A $50 minimum is required for all payouts and resets after each payment (e.g., $25/month pays out every other month). Payment frequency is set during contracting, with weekly as the default. EFTs are sent one business day after the commission cycle.',
    linesOfBusiness: ['Term / appointed'],
    agencyCode: 'Agent number Y710715',
    existing: true,
  },
  {
    id: 'brighthouse-metlife',
    name: 'Brighthouse (MetLife)',
    summary: 'Checks quarterly ($250) · EFT Wed (no min)',
    paySchedule:
      'Checks are mailed quarterly with a $250 minimum, and the cut-off is the last Friday of each quarter. The carrier is moving away from paper checks. EFT payments are deposited on Wednesdays with no minimum, and statements are available online on Tuesdays. The cut-off for EFT is Fridays.',
  },
  {
    id: 'cincinnati-life',
    name: 'Cincinnati Life',
    summary: '15th & month-end · +3 business days · $10 min',
    paySchedule:
      'Checks and EFT payments are sent 3 business days after the cycle ends on the 15th and month-end, with a $10 minimum for both.',
  },
  {
    id: 'columbus-life',
    name: 'Columbus Life',
    summary: 'EFT required · Wed cycle → Fri deposit · $25 min',
    paySchedule:
      'The commission cycle ends Wednesday evening. Payments processed by Wednesday are deposited on Friday. EFT is required with a $25 minimum.',
  },
  {
    id: 'fidelity-life',
    name: 'Fidelity Life',
    summary: 'Checks Mon · EFT Tue · $50 min · Thu cutoff',
    paySchedule:
      'Checks are mailed on Mondays and EFT is deposited on Tuesdays, both with a $50 minimum. The weekly cut-off is Thursday at the end of the day.',
  },
  {
    id: 'fidelity-guaranty',
    name: 'Fidelity & Guaranty',
    summary: 'Daily or weekly · EFT $10 / checks $50',
    paySchedule:
      'Agents can choose daily or weekly payments. Daily EFT is deposited as commissions are earned. For weekly payments, the cut-off is Friday, EFT deposits show on Tuesday, and checks are mailed on Monday. EFT has a $10 minimum, checks have a $50 minimum.',
  },
  {
    id: 'foresters',
    name: 'Foresters',
    summary: 'Thu–Wed cycle · EFT Friday · $50 min',
    paySchedule:
      'Commission pay periods run from Thursday to Wednesday, and payments are deposited on Fridays. Note that smaller banks and credit unions may take up to three business days to process deposits. All outstanding requirements must be completed by Tuesday at 5 PM EST. Commissions will include any business issued by Wednesday at 5 PM EST. A minimum of $50 in accumulated commission is required for payout.',
  },
  {
    id: 'genworth',
    name: 'Genworth',
    summary: 'Life quarterly checks · LTC/EFT Tue · $50 min',
    paySchedule:
      'Life checks are mailed quarterly. LTC checks are mailed every Tuesday. EFT payments for all policy types are deposited weekly on Tuesdays. A $50 minimum is required, with a weekly cutoff on Wednesdays.',
    linesOfBusiness: ['Life', 'LTC'],
  },
  {
    id: 'gerber-life',
    name: 'Gerber Life',
    summary: 'Processed Mon · paid Wed · $25 min',
    paySchedule:
      'A $25 minimum is required for checks and EFT. Commissions are processed on Mondays and paid out on Wednesdays.',
    linesOfBusiness: ['Life - Contracted via AMG/IDA'],
    existing: true,
  },
  {
    id: 'great-american-life',
    name: 'Great American',
    summary: 'Daily/weekly/bi-weekly/monthly · $50 min',
    paySchedule:
      'Checks or EFT are sent at the agent’s chosen frequency—daily, weekly, bi-weekly, or monthly—with a $50 minimum.',
    linesOfBusiness: ['Life / Annuity'],
  },
  {
    id: 'guggenheim',
    name: 'Guggenheim',
    summary: 'Weekly · Fri close → Mon release · $25 min',
    paySchedule:
      'Checks and EFT both have a $25 minimum and are paid out weekly. The cycle closes on Friday, and funds are released on Monday.',
  },
  {
    id: 'illinois-mutual',
    name: 'Illinois Mutual',
    summary: 'Checks 2x/mo ($500) · EFT $5 min',
    paySchedule:
      'Commission checks are mailed twice a month with a $500 minimum—around the 16th and the first week of the next month (includes the commission statement). For electronic payments, the minimum is $5. Commission statements are available on the carrier’s Agent Forum.',
    linesOfBusiness: ['Appointment active'],
    agencyCode: 'Producer code 89431',
    segment: ['Carrier (DI/Life)'],
    existing: true,
  },
  {
    id: 'john-hancock',
    name: 'John Hancock',
    summary: 'Checks Tue ($150) · EFT Wed (no min)',
    paySchedule:
      'Checks are mailed on Tuesdays with a $150 minimum and include the statement. EFT is deposited on Wednesdays with no minimum; statements are mailed the Saturday before. The weekly cutoff is Friday.',
  },
  {
    id: 'lafayette-life',
    name: 'Lafayette Life',
    summary: 'Checks 1st & 15th · EFT daily · $100 min',
    paySchedule:
      'Checks are issued on the 1st and 15th of each month. EFTs are deposited daily. Both have a $100 minimum.',
  },
  {
    id: 'lincoln-financial',
    name: 'Lincoln Financial',
    summary: 'EFT by Wed ($10) · checks $2,500 min',
    paySchedule:
      'Checks can be issued with a $2,500 minimum. The weekly cutoff is Friday, and EFTs are deposited by Wednesday ($10 minimum). Statements must be accessed on the Lincoln website unless receiving a paper check.',
  },
  {
    id: 'massmutual',
    name: 'MassMutual',
    summary: '1st & 3rd Tue cutoff · pay following Fri',
    paySchedule:
      'Commission cutoffs are on the first and third Tuesday of the month, with checks/vouchers (EFTs) mailed the following Friday. A $25 fee applies for paper checks.',
  },
  {
    id: 'minnesota-life',
    name: 'Minnesota Life',
    summary: 'EFT only · Fri cutoff · deposit Wed · as-earned',
    paySchedule:
      'EFT only, with no minimums. The weekly cutoff is Friday, statements are generated on Monday, and EFTs are deposited on Wednesday. Payments are as-earned.',
  },
  {
    id: 'mutual-of-omaha-united-of-omaha',
    name: 'Mutual of Omaha / United of Omaha',
    summary: 'Checks Thu/Fri ($250) · EFT Fri ($25) · Express daily',
    paySchedule:
      'Checks are mailed weekly on Thursday or Friday with a $250 minimum. EFTs are deposited weekly on Fridays with a $25 minimum. The weekly cutoff is Tuesday after close. Express Pay is available via EFT only and is issued daily as commissions are earned.',
    linesOfBusiness: ['IUL / term'],
    agencyCode: 'Producer IDs 1087863 and 1120392',
    existing: true,
  },
  {
    id: 'national-life-group',
    name: 'National Life Group',
    summary: 'Weekly Tue · checks $350 · EFT no min',
    paySchedule:
      'Checks have a $350 minimum, while EFTs have no minimum. Payouts are made weekly on Tuesdays, and commissions are processed on Thursdays.',
  },
  {
    id: 'nationwide-life',
    name: 'Nationwide',
    summary: 'Checks Mon · EFT Tue/Wed · Fri 4pm ET cutoff',
    paySchedule:
      'Checks are mailed weekly on Mondays. EFTs are deposited on Tuesdays or Wednesdays. The weekly cutoff is Friday at 4:00 PM Eastern.',
    linesOfBusiness: ['Life'],
  },
  {
    id: 'north-american',
    name: 'North American',
    summary: 'EFT only · Thu noon cutoff · deposit Tue · $50 min',
    paySchedule:
      'EFT only. The weekly cutoff is Thursday at noon, and EFTs are deposited on Tuesdays. There is a $50 minimum.',
  },
  {
    id: 'oneamerica',
    name: 'OneAmerica',
    summary: 'Monthly · 3rd workday after EOM · $1 min',
    paySchedule:
      'Checks are mailed monthly on the 3rd workday after month-end. EFTs are deposited the same day, unless over $300, in which case they are deposited immediately. The monthly cutoff is at the end of the month, with a $1 minimum.',
  },
  {
    id: 'oxford-life',
    name: 'Oxford Life',
    summary: 'EFT daily as-earned · $50 min',
    paySchedule:
      'All agents are requested to be paid via EFT, which is processed daily as commissions are earned. The minimum is $50.',
  },
  {
    id: 'protective',
    name: 'Protective',
    summary: 'Checks monthly ($100) · EFT weekly Mon (no min)',
    paySchedule:
      'Checks are mailed monthly during the first week after month-end with a $100 minimum. The cutoff is the last day of the month. EFTs are deposited weekly on Mondays with no minimum.',
  },
  {
    id: 'prudential',
    name: 'Prudential',
    summary: 'Checks/EFT Tue · checks $100 · Fri cutoff',
    paySchedule:
      'Checks are mailed on Tuesdays with a $100 minimum. EFTs are deposited on Tuesdays with no minimum. The weekly cutoff is Friday.',
  },
  {
    id: 'sagicor',
    name: 'Sagicor',
    summary: 'EFT only · daily · next business day · $50 min',
    paySchedule:
      'EFT only, with a $50 minimum. Commissions are paid daily and released the next business day after policies are settled.',
  },
  {
    id: 'sbli',
    name: 'SBLI',
    summary: 'Weekly–quarterly · EFT no min · checks $500',
    paySchedule:
      'Commissions are paid weekly, bi-weekly, monthly, or quarterly. There is no minimum for EFT, but the check minimum is $500.',
  },
  {
    id: 'securian',
    name: 'Securian',
    summary: '3rd business day each week · $25 min',
    paySchedule:
      'Compensation is paid on the third business day each week for business cleared the previous week, including premium payments and accepted delivery receipts. The minimum compensation payment is $25. Statements are available online on the second business day of the week.',
  },
  {
    id: 'symetra-life',
    name: 'Symetra Life',
    summary: 'Weekly–quarterly · EFT no min · checks $500',
    paySchedule:
      'Commissions are paid weekly, bi-weekly, monthly, or quarterly. There is no minimum for EFT, but the check minimum is $500. Weekly EFTs are processed on Fridays and may take 24-72 business hours to deposit.',
    linesOfBusiness: ['Term', 'IUL - approved GA eff 10/18/2023'],
    existing: true,
  },
  {
    id: 'transamerica',
    name: 'Transamerica',
    summary: 'Checks Mon ($500) · EFT Tue night (no min)',
    paySchedule:
      'Checks are mailed weekly or bi-weekly on Mondays with a $500 minimum. EFTs are deposited on Tuesday nights with no minimum. The weekly cutoff is Friday.',
  },
  {
    id: 'united-home-life',
    name: 'United Home Life',
    summary: 'EFT daily ($20) / weekly-monthly ($5) · checks monthly ($150)',
    paySchedule:
      'EFT deposits are made daily with a $20 minimum. Checks are mailed monthly with a $150 minimum. The cutoff is the last day of the month. EFTs are also deposited weekly or monthly with a $5 minimum. The EFT cutoff is Friday, and funds are deposited on Mondays.',
  },
  {
    id: 'voya',
    name: 'VOYA',
    summary: 'Checks monthly ($25) · EFT weekly/monthly ($5)',
    paySchedule:
      'Checks are mailed monthly with a $25 minimum. The cutoff is the last business day of the month. EFTs are deposited weekly or monthly with a $5 minimum. EFT cutoff is Friday, and funds are deposited on Mondays.',
  },
];

/** Build full Carrier records (new rows) / patch fields for seed + INITIAL merge. */
export function toAmgIdaCarrier(row: PayScheduleCarrier): Carrier {
  const segment = row.segment ?? ['Carrier (Life)'];
  const linesOfBusiness = row.linesOfBusiness ?? ['Life'];
  const notes = [
    `Appointed via ${AMG_IDA_GA}.`,
    ...linesOfBusiness,
  ].join(' ');

  return {
    id: row.id,
    name: row.name,
    isActive: true,
    segment,
    linesOfBusiness,
    agencyCode: row.agencyCode,
    generalAgent: AMG_IDA_GA,
    appetite: {
      canWrite: [
        `Approved classes under ${segment[0]} program.`,
        `Appetite details: ${linesOfBusiness.join(', ')}`,
      ],
      cannotWrite: ['Exposures outside standard carrier underwriting guidelines.'],
      notes,
    },
    contacts: [],
    incentives: {
      commissionRate: row.summary,
      preferredTier: `via ${AMG_IDA_GA}`,
      notes: row.notes,
      paySchedule: row.paySchedule,
    },
  };
}

export const AMG_IDA_CARRIERS: Carrier[] = AMG_IDA_PAY_SCHEDULE_CARRIERS.map(toAmgIdaCarrier);
