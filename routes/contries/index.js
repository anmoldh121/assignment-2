const Router = require("express").Router;
const path = require("path");


const controller = require("../../controller/contries");


Router.get("/countries", async () => {
    try {
        const resp = await controller.GetCountryList();
    } catch(err) {

    }
});