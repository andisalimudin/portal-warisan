
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@warisan.org.my'
  const icNumber = 'admin' // Used as identifier for login
  const password = 'admin123'
  
  const hashedPassword = await bcrypt.hash(password, 10)

  // Check if admin already exists by email or IC
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { icNumber }
      ]
    }
  })

  if (existingUser) {
    console.log('Admin user found. Updating credentials...')
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        passwordHash: hashedPassword,
        role: 'ADMIN',
        status: 'APPROVED'
      }
    })
    console.log('Admin user updated.')
  } else {
    console.log('Creating new admin user...')
    await prisma.user.create({
      data: {
        email,
        icNumber,
        fullName: 'System Administrator',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        status: 'APPROVED',
        phoneNumber: '0123456789',
        address: 'HQ Parti Warisan',
        postcode: '88000',
        city: 'Kota Kinabalu',
        state: 'Sabah',
        referralCode: 'ADMIN001'
      }
    })
    console.log('Admin user created successfully.')
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
