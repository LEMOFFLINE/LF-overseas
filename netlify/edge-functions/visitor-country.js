export default async (_request, context) => {
  if (context.cookies.get("lf_country")) return;

  const countryCode = String(context.geo?.country?.code || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(countryCode)) return;

  context.cookies.set({
    name: "lf_country",
    value: countryCode,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "Lax",
    secure: true,
  });
};
