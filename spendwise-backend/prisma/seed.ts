import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding default categories...')

  const systemUser = await prisma.user.upsert({
    where: { firebase_uid: 'system' },
    update: {},
    create: {
      firebase_uid: 'system',
      email: 'system@spendwise.app',
      name: 'System',
    },
  })

  const categories = [
    { name: 'Food & Dining',     icon: '🍛', color: '#EF9F27', keywords: ['zomato','swiggy','restaurant','hotel','cafe','dhaba'] },
    { name: 'Groceries',         icon: '🛒', color: '#1D9E75', keywords: ['dmart','bigbasket','blinkit','zepto','kirana','supermarket'] },
    { name: 'Transport',         icon: '🚗', color: '#378ADD', keywords: ['uber','ola','rapido','irctc','petrol','fuel','metro'] },
    { name: 'Health',            icon: '💊', color: '#7F77DD', keywords: ['apollo','medplus','pharma','hospital','clinic','doctor'] },
    { name: 'Shopping',          icon: '🛍️', color: '#D4537E', keywords: ['amazon','flipkart','myntra','ajio','nykaa','meesho'] },
    { name: 'Entertainment',     icon: '🎬', color: '#D85A30', keywords: ['netflix','hotstar','spotify','prime','bookmyshow'] },
    { name: 'Rent & Utilities',  icon: '🏠', color: '#5F5E5A', keywords: ['electricity','jio','airtel','rent','broadband','gas'] },
    { name: 'Education',         icon: '📚', color: '#639922', keywords: ['course','udemy','school','college','fees','coaching'] },
    { name: 'Travel',            icon: '✈️', color: '#0F6E56', keywords: ['makemytrip','goibibo','irctc','oyo','flight'] },
    { name: 'Family',            icon: '👨‍👩‍👧', color: '#993556', keywords: ['school fees','gift','birthday','medical','parents'] },
    { name: 'Investment',        icon: '💰', color: '#185FA5', keywords: ['zerodha','groww','sip','mutual fund','lic','insurance'] },
    { name: 'Others',            icon: '🔧', color: '#888780', keywords: [], is_default: true },
  ]

  for (const cat of categories) {
    await prisma.category.create({
      data: {
        ...cat,
        user_id: systemUser.id,
        is_default: cat.is_default ?? false,
      },
    })
  }

  console.log('✅ 12 categories seeded!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())