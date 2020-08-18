require("dotenv").config();
const AdminBro = require('admin-bro')
const mongoose = require('mongoose')
const AdminBroExpress = require('admin-bro-expressjs')
const AdminBroMongoose = require('admin-bro-mongoose')
AdminBro.registerAdapter(AdminBroMongoose)

const users = require("../Schemas/UserSchema")


const adminBro = new AdminBro({
  databases: [mongoose],
  resources : [{
    resource : users,
    options :{
     properties:{
      name: {
        isVisible: { list: false, filter: false, show: true, edit: false },
      }
     }

    }
  }],
  rootPath: '/admin',
  branding:{
      logo: "https://i.ibb.co/GC9qhGX/Vegh-Logo-01.png" ,
    companyName : "Vegh"
  }
})

const ADMIN = {
    email: process.env.ADMIN_ID ,
    password: process.env.ADMIN_PASSWORD ,
  }
  
  const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
    cookieName: process.env.ADMIN_COOKIE_NAME ,
    cookiePassword: process.env.ADMIN_COOKIE_PASS,
    authenticate: async (email, password) => {
      if (email === ADMIN.email && password === ADMIN.password) {
        return ADMIN
      }
      return null
    }
  })


module.exports = router;