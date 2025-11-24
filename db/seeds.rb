User.destroy_all

User.create!(
  email: "mesario@gmail.com",
  password: "12345678",
  role: "mesario"
)

User.create!(
  email: "eleitor@gmail.com",
  password: "12345678",
  role: "eleitor"
)

puts "Seeds criados com sucesso!"
