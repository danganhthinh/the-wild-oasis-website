"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { redirect } from "next/navigation";

const API_URL = "http://localhost:3000/api";

async function authenticatedFetch(path, options = {}) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.user.accessToken}`,
    ...options.headers,
  };

  console.log(`Website API Request: ${options.method || 'GET'} ${path}`, options.body || "");
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  
  if (!res.ok) {
    const error = await res.json();
    console.error(`Website API Error: ${options.method || 'GET'} ${path}`, error);
    throw new Error(error.message || "Something went wrong");
  }

  const data = await res.json();
  console.log(`Website API Response: ${options.method || 'GET'} ${path}`, data);
  return data;
}

export async function updateProfile(formData) {
  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");
  
  const updateData = { nationality, countryFlag, nationalID };
  
  await authenticatedFetch("/guests/me", {
    method: "PATCH",
    body: JSON.stringify(updateData),
  });

  revalidatePath("/account/profile");
}

export async function createBooking(bookingData, formData) {
  const newBooking = {
    cabinId: bookingData.cabinId,
    startDate: bookingData.startDate,
    endDate: bookingData.endDate,
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations")?.slice(0, 500) || "",
  };

  await authenticatedFetch("/bookings", {
    method: "POST",
    body: JSON.stringify(newBooking),
  });

  revalidatePath(`/cabins/${bookingData.cabinId}`);
  redirect("/cabins/thankyou");
}

export async function deleteBooking(bookingId) {
  await authenticatedFetch(`/bookings/${bookingId}`, {
    method: "DELETE",
  });

  revalidatePath("/account/reservations");
}

export async function updateBooking(formData) {
  const bookingId = formData.get("bookingId");
  const updateData = {
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 500),
  };

  await authenticatedFetch(`/bookings/${bookingId}`, {
    method: "PATCH",
    body: JSON.stringify(updateData),
  });

  revalidatePath("/account/reservations");
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  redirect("/account/reservations");
}

export async function singInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
