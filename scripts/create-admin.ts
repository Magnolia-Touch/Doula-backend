import { PrismaClient, Role } from "@prisma/client";
import * as readline from "readline"

const prisma = new PrismaClient()
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const ask = (question: string) =>
    new Promise<string>((resolve) => rl.question(question, resolve));

async function main() {
    try {
        const name = await ask('Admin Name: ');
        const email = await ask('Admin Email: ');
        const phone = await ask('Admin Phone: ');
        const password = await ask('Admin Password: ');  // optional if you need

        const admin = await prisma.user.create({
            data: {
                name,
                email,
                phone,       // hash it if your schema requires
                role: Role.ADMIN, // <-- make sure ADMIN role exists in your enum
                adminProfile: { create: {} }
            },
        });

        console.log('\n✔ Admin user created successfully');
        console.log(admin);
    } catch (err) {
        console.error('\n❌ Error creating admin:', err.message);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

main()