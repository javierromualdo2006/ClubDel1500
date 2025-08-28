/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("password2956748965")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(2, new Field({
    "cost": 11,
    "hidden": true,
    "id": "password2956748965",
    "max": 0,
    "min": 8,
    "name": "confirmPassword",
    "pattern": "",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "password"
  }))

  return app.save(collection)
})
