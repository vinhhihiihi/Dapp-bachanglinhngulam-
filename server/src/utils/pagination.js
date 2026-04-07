export function getPaginationParams(query) {
  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(query.limit ?? "12", 10) || 12)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
