import { defineField, defineType } from "sanity";

export default defineType({
  name: "nominee",
  title: "Nominee",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required().min(2)
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3
    })
  ]
});
