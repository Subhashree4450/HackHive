// 

const express = require("express");
const router = express.Router();
const xmlMediator = require("../xml_mediator/xmlMediator");

router.post("/", async (req, res) => {
    try {
        const xmlQuery = req.body; // XML request body
        const responseXml = await xmlMediator(xmlQuery);

        res.set("Content-Type", "application/xml");
        res.send(responseXml);
    } catch (error) {
        res.status(500).send(`<error>${error.message}</error>`);
    }
});

module.exports = router;
