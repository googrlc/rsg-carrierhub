/**
 * Life carriers appointed via GA AMGDA (AMG/IDA life brokerage).
 * Pay schedule details are stored in incentives.notes for display in the
 * Carrier Drawer → Incentives tab.
 */
import type { Carrier } from '../types';

export const GA_AMGDA = 'GA AMGDA';

interface AmgdaLifeCarrierDef {
  id: string;
  name: string;
  linesOfBusiness?: string[];
  agencyCode?: string;
  website?: string;
  agentLogin?: string;
  paySchedule: string;
}

const DEFS: AmgdaLifeCarrierDef[] = [
  {
    id: 'cica-life',
    name: 'Cica Life',
    linesOfBusiness: ['Final Expense / Whole Life'],
    paySchedule:
      'Commissions are paid once a month, on the 10th, for the previous month\'s policies with a $10 minimum.',
  },
  {
    id: 'accordia',
    name: 'Accordia',
    paySchedule:
      'Checks are mailed at the end of each month. The cut-off for EFT is every Friday, with deposits made the following Tuesday. $25 minimum applies to both payment methods.',
  },
  {
    id: 'aetna-american-equity',
    name: 'Aetna/American Equity',
    paySchedule:
      'EFTs are deposited every Friday, with cut-offs on Wednesday and Saturday each week.',
  },
  {
    id: 'allianz-life',
    name: 'Allianz',
    linesOfBusiness: ['Life / Annuities'],
    paySchedule:
      'Checks are mailed on Tuesdays with a $250 minimum. EFTs are deposited daily, with a weekly cut-off on Fridays.',
  },
  {
    id: 'american-general-life-aig-corebridge',
    name: 'American General',
    linesOfBusiness: ['Life'],
    paySchedule:
      'Checks are mailed every two weeks on Fridays. New agents are paid by EFT only, with deposits made weekly on Thursdays. There is a $50 minimum and a Friday cut-off. For commission questions or statements, email Corebridge commissions at imobgacomp@corebridgefinancial.com.',
  },
  {
    id: 'american-general-annuities',
    name: 'American General (Annuities)',
    linesOfBusiness: ['Annuities'],
    paySchedule:
      'For commissions earned from 1/6/2024 to 1/10/2025, payments and statements will follow the current process and be released on Monday, January 13, 2025. Timing of receipt depends on the agent\'s bank. Starting 1/13/2025, commissions will be paid and statements released the next day, based on the agent\'s bank processing times.',
  },
  {
    id: 'american-national',
    name: 'American National',
    paySchedule:
      'EFTs and checks are issued every Tuesday with a $50 minimum. The cut-off is Friday.',
  },
  {
    id: 'ameritas',
    name: 'Ameritas',
    paySchedule:
      'EFTs are deposited 3 days after the cycle closes on the 15th and 30th. Checks are mailed on the 15th and 30th. No minimum required.',
  },
  {
    id: 'athene-annuity',
    name: 'Athene Annuity',
    linesOfBusiness: ['Annuities'],
    paySchedule:
      'Checks are mailed at the end of each month with a $50 minimum. EFTs are deposited weekly with the same minimum.',
  },
  {
    id: 'axa-equitable',
    name: 'AXA Equitable',
    paySchedule:
      'Checks are mailed on Thursday of the following week with a $250 minimum for renewal. The weekly cut-off is Thursday. EFT payments are deposited on Friday of the following week, also with a $250 minimum for renewal.',
  },
  {
    id: 'banner-life-legal-general-america',
    name: 'Banner',
    linesOfBusiness: ['Term / IUL'],
    agencyCode: 'Agent number Y710715',
    paySchedule:
      'Direct deposit is preferred. Checks are sent to AMG\'s home office, then forwarded to the agent. A $50 minimum is required for all payouts and resets after each payment (e.g., $25/month pays out every other month). Payment frequency is set during contracting, with weekly as the default. EFTs are sent one business day after the commission cycle.',
  },
  {
    id: 'brighthouse-metlife',
    name: 'Brighthouse (MetLife)',
    paySchedule:
      'Checks are mailed quarterly with a $250 minimum, and the cut-off is the last Friday of each quarter. The carrier is moving away from paper checks. EFT payments are deposited on Wednesdays with no minimum, and statements are available online on Tuesdays. The cut-off for EFT is Fridays.',
  },
  {
    id: 'cincinnati-life',
    name: 'Cincinnati Life',
    paySchedule:
      'Checks and EFT payments are sent 3 business days after the cycle ends on the 15th and month-end, with a $10 minimum for both.',
  },
  {
    id: 'columbus-life',
    name: 'Columbus Life',
    paySchedule:
      'The commission cycle ends Wednesday evening. Payments processed by Wednesday are deposited on Friday. EFT is required with a $25 minimum.',
  },
  {
    id: 'fidelity-life',
    name: 'Fidelity Life',
    paySchedule:
      'Checks are mailed on Mondays and EFT is deposited on Tuesdays, both with a $50 minimum. The weekly cut-off is Thursday at the end of the day.',
  },
  {
    id: 'fidelity-guaranty',
    name: 'Fidelity & Guaranty',
    paySchedule:
      'Agents can choose daily or weekly payments. Daily EFT is deposited as commissions are earned. For weekly payments, the cut-off is Friday, EFT deposits show on Tuesday, and checks are mailed on Monday. EFT has a $10 minimum, checks have a $50 minimum.',
  },
  {
    id: 'foresters',
    name: 'Foresters',
    paySchedule:
      'Commission pay periods run from Thursday to Wednesday, and payments are deposited on Fridays. Note that smaller banks and credit unions may take up to three business days to process deposits. All outstanding requirements must be completed by Tuesday at 5 PM EST. Commissions will include any business issued by Wednesday at 5 PM EST. A minimum of $50 in accumulated commission is required for payout.',
  },
  {
    id: 'genworth',
    name: 'Genworth',
    linesOfBusiness: ['Life', 'LTC'],
    paySchedule:
      'Life checks are mailed quarterly. LTC checks are mailed every Tuesday. EFT payments for all policy types are deposited weekly on Tuesdays. A $50 minimum is required, with a weekly cutoff on Wednesdays.',
  },
  {
    id: 'gerber-life',
    name: 'Gerber',
    linesOfBusiness: ['Juvenile Life'],
    paySchedule:
      'A $25 minimum is required for checks and EFT. Commissions are processed on Mondays and paid out on Wednesdays.',
  },
  {
    id: 'great-american',
    name: 'Great American',
    paySchedule:
      'Checks or EFT are sent at the agent\'s chosen frequency—daily, weekly, bi-weekly, or monthly—with a $50 minimum.',
  },
  {
    id: 'guggenheim',
    name: 'Guggenheim',
    linesOfBusiness: ['Annuities'],
    paySchedule:
      'Checks and EFT both have a $25 minimum and are paid out weekly. The cycle closes on Friday, and funds are released on Monday.',
  },
  {
    id: 'illinois-mutual',
    name: 'Illinois Mutual',
    linesOfBusiness: ['DI / Life'],
    agencyCode: 'Producer code 89431',
    paySchedule:
      'Commission checks are mailed twice a month with a $500 minimum—around the 16th and the first week of the next month (includes the commission statement). For electronic payments, the minimum is $5. Commission statements are available on the carrier\'s Agent Forum.',
  },
  {
    id: 'john-hancock',
    name: 'John Hancock',
    paySchedule:
      'Checks are mailed on Tuesdays with a $150 minimum and include the statement. EFT is deposited on Wednesdays with no minimum; statements are mailed the Saturday before. The weekly cutoff is Friday.',
  },
  {
    id: 'lafayette-life',
    name: 'Lafayette Life',
    paySchedule:
      'Checks are issued on the 1st and 15th of each month. EFTs are deposited daily. Both have a $100 minimum.',
  },
  {
    id: 'lincoln-financial',
    name: 'Lincoln Financial',
    paySchedule:
      'Checks can be issued with a $2,500 minimum. The weekly cutoff is Friday, and EFTs are deposited by Wednesday ($10 minimum). Statements must be accessed on the Lincoln website unless receiving a paper check.',
  },
  {
    id: 'massmutual',
    name: 'MassMutual',
    paySchedule:
      'Commission cutoffs are on the first and third Tuesday of the month, with checks/vouchers (EFTs) mailed the following Friday. A $25 fee applies for paper checks.',
  },
  {
    id: 'minnesota-life',
    name: 'Minnesota Life',
    paySchedule:
      'EFT only, with no minimums. The weekly cutoff is Friday, statements are generated on Monday, and EFTs are deposited on Wednesday. Payments are as-earned.',
  },
  {
    id: 'mutual-of-omaha-united-of-omaha',
    name: 'Mutual of Omaha',
    linesOfBusiness: ['IUL / Term'],
    agencyCode: 'Producer IDs 1087863 and 1120392',
    paySchedule:
      'Checks are mailed weekly on Thursday or Friday with a $250 minimum. EFTs are deposited weekly on Fridays with a $25 minimum. The weekly cutoff is Tuesday after close. Express Pay is available via EFT only and is issued daily as commissions are earned.',
  },
  {
    id: 'national-life-group',
    name: 'National Life Group',
    paySchedule:
      'Checks have a $350 minimum, while EFTs have no minimum. Payouts are made weekly on Tuesdays, and commissions are processed on Thursdays.',
  },
  {
    id: 'nationwide-life',
    name: 'Nationwide',
    linesOfBusiness: ['Life / Annuities'],
    paySchedule:
      'Checks are mailed weekly on Mondays. EFTs are deposited on Tuesdays or Wednesdays. The weekly cutoff is Friday at 4:00 PM Eastern.',
  },
  {
    id: 'north-american',
    name: 'North American',
    linesOfBusiness: ['Annuities'],
    paySchedule:
      'EFT only. The weekly cutoff is Thursday at noon, and EFTs are deposited on Tuesdays. There is a $50 minimum.',
  },
  {
    id: 'oneamerica',
    name: 'OneAmerica',
    paySchedule:
      'Checks are mailed monthly on the 3rd workday after month-end. EFTs are deposited the same day, unless over $300, in which case they are deposited immediately. The monthly cutoff is at the end of the month, with a $1 minimum.',
  },
  {
    id: 'oxford-life',
    name: 'Oxford Life',
    paySchedule:
      'All agents are requested to be paid via EFT, which is processed daily as commissions are earned. The minimum is $50.',
  },
  {
    id: 'protective',
    name: 'Protective',
    paySchedule:
      'Checks are mailed monthly during the first week after month-end with a $100 minimum. The cutoff is the last day of the month. EFTs are deposited weekly on Mondays with no minimum.',
  },
  {
    id: 'prudential',
    name: 'Prudential',
    paySchedule:
      'Checks are mailed on Tuesdays with a $100 minimum. EFTs are deposited on Tuesdays with no minimum. The weekly cutoff is Friday.',
  },
  {
    id: 'sagicor',
    name: 'Sagicor',
    paySchedule:
      'EFT only, with a $50 minimum. Commissions are paid daily and released the next business day after policies are settled.',
  },
  {
    id: 'sbli',
    name: 'SBLI',
    paySchedule:
      'Commissions are paid weekly, bi-weekly, monthly, or quarterly. There is no minimum for EFT, but the check minimum is $500.',
  },
  {
    id: 'securian',
    name: 'Securian',
    paySchedule:
      'Compensation is paid on the third business day each week for business cleared the previous week, including premium payments and accepted delivery receipts. The minimum compensation payment is $25. Statements are available online on the second business day of the week.',
  },
  {
    id: 'symetra-life',
    name: 'Symetra',
    linesOfBusiness: ['Term', 'IUL'],
    paySchedule:
      'Commissions are paid weekly, bi-weekly, monthly, or quarterly. There is no minimum for EFT, but the check minimum is $500. Weekly EFTs are processed on Fridays and may take 24-72 business hours to deposit.',
  },
  {
    id: 'transamerica',
    name: 'Transamerica',
    paySchedule:
      'Checks are mailed weekly or bi-weekly on Mondays with a $500 minimum. EFTs are deposited on Tuesday nights with no minimum. The weekly cutoff is Friday.',
  },
  {
    id: 'united-home-life',
    name: 'United Home Life',
    paySchedule:
      'EFT deposits are made daily with a $20 minimum. Checks are mailed monthly with a $150 minimum. The cutoff is the last day of the month. EFTs are also deposited weekly or monthly with a $5 minimum. The EFT cutoff is Friday, and funds are deposited on Mondays.',
  },
  {
    id: 'voya',
    name: 'VOYA',
    paySchedule:
      'Checks are mailed monthly with a $25 minimum. The cutoff is the last business day of the month. EFTs are deposited weekly or monthly with a $5 minimum. EFT cutoff is Friday, and funds are deposited on Mondays.',
  },
];

function buildCarrier(def: AmgdaLifeCarrierDef): Carrier {
  return {
    id: def.id,
    name: def.name,
    isActive: true,
    segment: ['Carrier (Life)'],
    linesOfBusiness: def.linesOfBusiness ?? ['Life'],
    generalAgent: GA_AMGDA,
    agencyCode: def.agencyCode,
    website: def.website,
    agentLogin: def.agentLogin,
    appetite: {
      canWrite: ['Approved classes under AMGDA life brokerage program.'],
      cannotWrite: ['Exposures outside standard carrier underwriting guidelines.'],
      notes: `Appointed via ${GA_AMGDA}.`,
    },
    contacts: [],
    incentives: {
      commissionRate: 'AMGDA Pay Schedule',
      notes: def.paySchedule,
    },
  };
}

/** All life carriers appointed through GA AMGDA with pay schedule details. */
export const AMGDA_LIFE_CARRIERS: Carrier[] = DEFS.map(buildCarrier);

/** Lookup pay schedule text by carrier id. */
export const AMGDA_PAY_SCHEDULES: Record<string, string> = Object.fromEntries(
  DEFS.map((d) => [d.id, d.paySchedule]),
);
