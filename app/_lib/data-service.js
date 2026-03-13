const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;
const IMAGE_URL_BASE = process.env.NEXT_PUBLIC_API_URL;

const mapCabinImage = (cabin) => {
  if (!cabin) return cabin;
  // If image is a relative path like 'uploads/...', prepend IMAGE_URL_BASE
  if (cabin.image && !cabin.image.startsWith("http")) {
    return { ...cabin, image: `${IMAGE_URL_BASE}/${cabin.image}` };
  }
  return cabin;
};

export async function getCabin(id) {
  const res = await fetch(`${API_URL}/cabins/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return mapCabinImage(data);
}

export async function getCabinPrice(id) {
  const res = await fetch(`${API_URL}/cabins/${id}`); // We can filter fields if needed
  if (!res.ok) return null;
  const data = await res.json();
  return { regularPrice: data.regularPrice, discount: data.discount };
}

export const getCabins = async function () {
  const res = await fetch(`${API_URL}/cabins`);
  if (!res.ok) throw new Error("Cabins could not be loaded");
  const data = await res.json();
  return data.map(mapCabinImage);
};

export async function getGuest(email) {
  const res = await fetch(`${API_URL}/guests/email/${email}`);
  if (!res.ok) return null;
  return await res.json();
}

export async function getBooking(id, token) {
  if (!token) return null;

  console.log(`Website API Request: GET /bookings/${id}`);
  const res = await fetch(`${API_URL}/bookings/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    console.error(`Website API Error: GET /bookings/${id}`, error);
    throw new Error("Booking could not get loaded");
  }

  const data = await res.json();
  if (data.cabins) data.cabins = mapCabinImage(data.cabins);
  console.log(`Website API Response: GET /bookings/${id}`, data);
  return data;
}

export async function getBookings(token) {
  if (!token) return [];

  console.log(`Website API Request: GET /bookings/guest`);
  const res = await fetch(`${API_URL}/bookings/guest`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    console.error(`Website API Error: GET /bookings/guest`, error);
    throw new Error("Bookings could not get loaded");
  }

  const data = await res.json();
  const mappedData = data.map(booking => {
    if (booking.cabins) booking.cabins = mapCabinImage(booking.cabins);
    return booking;
  });
  console.log(`Website API Response: GET /bookings/guest`, mappedData);
  return mappedData;
}

export async function getSettings() {
  const res = await fetch(`${API_URL}/settings`);
  if (!res.ok) throw new Error("Settings could not be loaded");
  return await res.json();
}

export async function createGuest(newGuest) {
  const body = JSON.stringify({ 
    idToken: newGuest.idToken,
    email: newGuest.email, 
    fullName: newGuest.fullName 
  });
  console.log(`Website API Request: POST /auth/guest/google`, body);

  const res = await fetch(`${API_URL}/auth/guest/google`, {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body
  });
  if (!res.ok) {
    const error = await res.json();
    console.error(`Website API Error: POST /auth/guest/google`, error);
    throw new Error("Guest could not be created");
  }
  const data = await res.json();
  console.log(`Website API Response: POST /auth/guest/google`, data);
  return data;
}

export async function getBookedDatesByCabinId(cabinId) {
  const res = await fetch(`${API_URL}/bookings/cabin/${cabinId}/booked-dates`);
  if (!res.ok) return [];
  const bookings = await res.json();
  
  // Convert booking ranges to individual dates as expected by the frontend
  const bookedDates = bookings.flatMap((booking) => {
    const range = [];
    let currentDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    
    while (currentDate <= endDate) {
      range.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return range;
  });

  return bookedDates;
}

// ... other functions similar mapping ...
export async function getCountries() {
  try {
    const res = await fetch("https://restcountries.com/v2/all?fields=name,flag");
    const countries = await res.json();
    return countries;
  } catch {
    throw new Error("Could not fetch countries");
  }
}
