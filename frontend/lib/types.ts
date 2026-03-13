export interface NDAFormData {
  purpose: string
  effectiveDate: string
  mndaTermType: 'expires' | 'continues'
  mndaTermYears: string
  confidentialityTermType: 'years' | 'perpetuity'
  confidentialityTermYears: string
  governingLaw: string
  jurisdiction: string
  party1PrintName: string
  party1Title: string
  party1Company: string
  party1NoticeAddress: string
  party1Date: string
  party2PrintName: string
  party2Title: string
  party2Company: string
  party2NoticeAddress: string
  party2Date: string
}

export const defaultFormData: NDAFormData = {
  purpose: '',
  effectiveDate: '',
  mndaTermType: 'expires',
  mndaTermYears: '1',
  confidentialityTermType: 'years',
  confidentialityTermYears: '1',
  governingLaw: '',
  jurisdiction: '',
  party1PrintName: '',
  party1Title: '',
  party1Company: '',
  party1NoticeAddress: '',
  party1Date: '',
  party2PrintName: '',
  party2Title: '',
  party2Company: '',
  party2NoticeAddress: '',
  party2Date: '',
}
