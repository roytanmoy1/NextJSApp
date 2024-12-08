'use server';
import {z} from 'zod';
import {sql} from '@vercel/postgres';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending' , 'paid']),
    date: z.string()
});



const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({id : true,date: true});


export async function createInvoice(formData: FormData) {
    // Now we will validate the user entered data before sending it to db

    // Use Object.fromEntries(formData.entries()) for forms with a lot of entries
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    const dateVal = new Date().toISOString().split('T')[0];


    const amountInCents = amount * 100; // storing the amount in cents to avoid any floating point errors


    // now we have proper use entries prepared for the db insertion
    await sql`INSERT INTO invoices (customer_id,amount,status,date) VALUES (${customerId},${amountInCents},${status},${dateVal})`;

    // now we will clear the Client-side Router cache and trigger a new request to the server
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id:string,formData:FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100; // storing the amount in cents to avoid any floating point errors

    await sql`UPDATE invoices set customer_id = ${customerId}, amount = ${amountInCents} , status = ${status} where id = ${id}`;
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}