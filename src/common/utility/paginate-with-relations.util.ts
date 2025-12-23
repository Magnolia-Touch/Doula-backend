// src/common/utils/paginate-with-relations.util.ts
export async function paginateWithRelations<T>({
  query,
  countQuery,
  page = 1,
  limit = 10,
}: {
  query: () => Promise<T[]>;
  countQuery: () => Promise<number>;
  page?: number;
  limit?: number;
}) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([query(), countQuery()]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
}
