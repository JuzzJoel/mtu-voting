export const categoriesWithNomineesQuery = `
*[_type == "category"] | order(order asc) {
  _id,
  name,
  order,
  "nominees": *[_type == "nominee" && references(^._id)] | order(name asc) {
    _id,
    name,
    "imageUrl": image.asset->url,
    description
  }
}
`
