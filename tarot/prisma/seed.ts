import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash("123456", 10)
  const user = await prisma.user.upsert({
    where: { email: "demo@tarot.app" },
    update: {},
    create: {
      nickname: "星月",
      email: "demo@tarot.app",
      password,
      birthday: new Date("1998-06-15"),
      gender: "女",
    },
  })
  console.log("Demo user created:", user.id, user.nickname)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1) })
