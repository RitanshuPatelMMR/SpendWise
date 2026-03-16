export type ParsedSMS = {
  amount: number
  merchant: string
  bank: string
  account_masked: string
  mode: string
  txn_type: string
  upi_ref: string
  transaction_date: string
  sms_raw: string
}

export function parseSMS(sms: string): ParsedSMS | null {
  const text = sms.toLowerCase()

  // Ignore OTP, promotional, credit SMS
  if (text.includes('otp') || text.includes('password')) return null
  if (text.includes('credited') && !text.includes('debited')) return null
  if (text.includes('available balance') && !text.includes('debited')) return null

  // Extract amount
  const amountMatch = sms.match(
    /(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i
  )
  if (!amountMatch) return null
  const amount = parseFloat(amountMatch[1].replace(/,/g, ''))
  if (isNaN(amount) || amount <= 0) return null

  // Must be a debit
  if (!text.includes('debited') && !text.includes('debit') &&
      !text.includes('paid') && !text.includes('payment')) return null

  // Extract bank name
  let bank = 'Unknown'
  const banks = [
    'Axis Bank', 'HDFC Bank', 'SBI', 'ICICI Bank', 'Kotak Bank',
    'IndusInd Bank', 'Yes Bank', 'IDFC Bank', 'Punjab National Bank',
    'Bank of Baroda', 'Canara Bank', 'Union Bank'
  ]
  for (const b of banks) {
    if (sms.toLowerCase().includes(b.toLowerCase())) {
      bank = b
      break
    }
  }

  // Extract account number
  const accountMatch = sms.match(/[Aa]\/[Cc]\s*(?:no\.?)?\s*([Xx\d]+)/i)
  const account_masked = accountMatch ? accountMatch[1] : ''

  // Extract UPI reference
  const upiRefMatch = sms.match(/UPI\/?(?:P2[MP]\/)?(\d{10,})/i)
  const upi_ref = upiRefMatch ? upiRefMatch[1] : ''

  // Extract mode
  let mode = 'UPI'
  if (text.includes('neft')) mode = 'NEFT'
  else if (text.includes('imps')) mode = 'IMPS'
  else if (text.includes('rtgs')) mode = 'RTGS'
  else if (text.includes('atm') || text.includes('cash')) mode = 'ATM'

  // Extract transaction type
  let txn_type = 'P2M'
  if (text.includes('p2p')) txn_type = 'P2P'
  else if (text.includes('p2m')) txn_type = 'P2M'

  // Extract merchant name
  let merchant = 'Unknown Merchant'
  const upiMerchantMatch = sms.match(
    /UPI\/P2[MP]\/\d+\/([A-Z\s]+?)(?:\n|$)/i
  )
  if (upiMerchantMatch) {
    merchant = upiMerchantMatch[1].trim()
  } else {
    // Try to extract from common patterns
    const merchantMatch = sms.match(/to\s+([A-Z\s]+?)(?:\s+on|\s+at|\n|$)/i)
    if (merchantMatch) merchant = merchantMatch[1].trim()
  }

  // Extract date
  const dateMatch = sms.match(/(\d{2}[-/]\d{2}[-/]\d{2,4})/i)
  let transaction_date = new Date().toISOString()
  if (dateMatch) {
    try {
      const parts = dateMatch[1].split(/[-/]/)
      const day = parseInt(parts[0])
      const month = parseInt(parts[1]) - 1
      const year = parseInt(parts[2]) < 100
        ? 2000 + parseInt(parts[2])
        : parseInt(parts[2])
      const date = new Date(year, month, day)
      if (!isNaN(date.getTime())) {
        transaction_date = date.toISOString()
      }
    } catch (e) {
      transaction_date = new Date().toISOString()
    }
  }

  return {
    amount,
    merchant,
    bank,
    account_masked,
    mode,
    txn_type,
    upi_ref,
    transaction_date,
    sms_raw: sms,
  }
}
// TEST — remove before production
export function testParser() {
  const testSMS = `INR 60.00 debited A/c no. XX2706 14-03-26, 22:11:00
UPI/P2M/643981255700/SUNIL GHANSHAM KHAI
Not you? SMS BLOCKUPI Cust ID to 919951860002 Axis Bank`

  const result = parseSMS(testSMS)
  console.log('SMS Parser Test Result:', JSON.stringify(result, null, 2))
  return result
}