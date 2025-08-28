/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "createRule": "",
    "deleteRule": "@request.auth.rule = \"admin\"",
    "updateRule": "@request.auth.id != \"\" && (@request.auth.id = id || @request.auth.rule = \"admin\")",
    "viewRule": "@request.auth.id != \"\" && (@request.auth.id = id || @request.auth.rule = \"admin\")"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "createRule": "id = @request.auth.id",
    "deleteRule": "id = @request.auth.id",
    "updateRule": "id = @request.auth.id",
    "viewRule": "id = @request.auth.id"
  }, collection)

  return app.save(collection)
})
