"use server";
import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0" }), // because we r coercing from str to number, empty string will become 0, gt func = greater than
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status",
  }),
  date: z.string(),
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
  // Now we will validate the user entered data before sending it to db

  // Use Object.fromEntries(formData.entries()) for forms with a lot of entries
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  // using safeparse to perform server side input validation
    if (!validatedFields.success) {
    //successfully performing input validation
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }
  const { customerId, amount, status } = validatedFields.data;

  const dateVal = new Date().toISOString().split("T")[0];

  const amountInCents = amount * 100; // storing the amount in cents to avoid any floating point errors

  // now we have proper use entries prepared for the db insertion
  try {
    await sql`INSERT INTO invoices (customer_id,amount,status,date) VALUES (${customerId},${amountInCents},${status},${dateVal})`;

    // now we will clear the Client-side Router cache and trigger a new request to the server
  } catch (err) {
    console.log(err);
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateInvoice(id: string, formData: FormData) {
  try {
    const { customerId, amount, status } = UpdateInvoice.parse({
      customerId: formData.get("customerId"),
      amount: formData.get("amount"),
      status: formData.get("status"),
    });

    const amountInCents = amount * 100; // storing the amount in cents to avoid any floating point errors

    await sql`UPDATE invoices set customer_id = ${customerId}, amount = ${amountInCents} , status = ${status} where id = ${id}`;
  } catch (err) {
    console.log(err);
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE from invoices where id = ${id}`;
  } catch (err) {
    console.log(err);
  }
  revalidatePath("/dashboard/invoices");
}
