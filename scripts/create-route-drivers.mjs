import { createClient } from "@supabase/supabase-js";
import { writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const emailDomain = process.env.DRIVER_EMAIL_DOMAIN ?? "satthwal.local";
const outputPath = process.env.DRIVER_CREDENTIALS_PATH ?? "driver-credentials.txt";

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to your shell before running this script.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function passwordFor(routeId) {
  return `SatThwal-${routeId.slice(0, 8)}-${randomUUID().slice(0, 8)}!`;
}

async function findUserByEmail(email) {
  const perPage = 1000;
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (data.users.length < perPage) return null;
  }

  return null;
}

async function upsertDriverForRoute(route) {
  const email = `driver.${slugify(route.route_name)}@${emailDomain}`;
  const password = passwordFor(route.id);
  const providerName = route.driver_name || route.route_name;
  const metadata = {
    role: "driver",
    full_name: providerName,
    provider_name: providerName,
    township: route.pickup_township,
    vehicle_type: route.vehicle_type,
    vehicle_number: route.vehicle_number,
  };

  let user = await findUserByEmail(email);
  if (user) {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: metadata,
    });
    if (error) throw error;
    user = data.user;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });
    if (error) throw error;
    user = data.user;
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: providerName,
    township: route.pickup_township,
    role: "driver",
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  });
  if (profileError) throw profileError;

  const { error: driverProfileError } = await supabase.from("driver_profiles").upsert({
    id: user.id,
    provider_name: providerName,
    township: route.pickup_township,
    vehicle_types: route.vehicle_type ? [route.vehicle_type] : [],
    vehicle_number: route.vehicle_number,
    status: "active",
    updated_at: new Date().toISOString(),
  });
  if (driverProfileError) throw driverProfileError;

  const { error: routeError } = await supabase
    .from("transportation_routes")
    .update({
      driver_id: user.id,
      driver_name: providerName,
    })
    .eq("id", route.id);
  if (routeError) throw routeError;

  return {
    routeName: route.route_name,
    driverName: providerName,
    email,
    password,
  };
}

const { data: routes, error: routesError } = await supabase
  .from("transportation_routes")
  .select("id, route_name, pickup_township, driver_name, vehicle_type, vehicle_number")
  .order("departure_time", { ascending: true });

if (routesError) throw routesError;
if (!routes?.length) {
  console.error("No transportation routes found.");
  process.exit(1);
}

const credentials = [];
for (const route of routes) {
  credentials.push(await upsertDriverForRoute(route));
}

const lines = [
  "Sat Thwal route driver accounts",
  `Generated at: ${new Date().toISOString()}`,
  "",
  ...credentials.flatMap((item) => [
    `Route: ${item.routeName}`,
    `Driver: ${item.driverName}`,
    `Email: ${item.email}`,
    `Password: ${item.password}`,
    "",
  ]),
];

await writeFile(outputPath, lines.join("\n"), "utf8");
console.log(`Created or updated ${credentials.length} driver accounts.`);
console.log(`Credentials written to ${outputPath}. Keep this file private.`);
