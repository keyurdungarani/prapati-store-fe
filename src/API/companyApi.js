import { apiSlice } from './baseApi';

export const companyApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        addCompany: builder.mutation({
            query: ({ name, platforms }) => ({
                url: "/company/add-company",
                method: "POST",
                body: { name, platforms },
            }),
        }),
        listCompanies: builder.query({
            query: () => ({
                url: "/company/list-companies",
                method: "GET",
            }),
        }),
        updateCompany: builder.mutation({
            query: ({ id, name, platforms }) => ({
                url: `/company/update-company/${id}`,
                method: "PUT",
                body: { name, platforms },
            }),
        }),
        deleteCompany: builder.mutation({
            query: (id) => ({
                url: `/company/delete-company/${id}`,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useAddCompanyMutation,
    useListCompaniesQuery,
    useUpdateCompanyMutation,
    useDeleteCompanyMutation,
} = companyApiSlice;