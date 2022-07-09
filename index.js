const express = require("express");
const envelopes = require("./envelopes");
const app = express();

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

app.param("category", (req, res, next, category) => {
    const envelope = envelopes[category];
    if (!envelope) {
        const err = new Error();
        err.status = 404;
        return next(err);
    }
    req.category = category;
    req.envelope = envelope;
    next();
});

app.param("fromCategory", (req, res, next, fromCategory) => {
    const fromEnvelope = envelopes[fromCategory];
    if (!fromEnvelope) {
        const err = new Error();
        err.status = 404;
        return next(err);
    }
    req.fromCategory = fromCategory;
    req.fromEnvelope = fromEnvelope;
    next();
});

app.param("toCategory", (req, res, next, toCategory) => {
    const toEnvelope = envelopes[toCategory];
    if (!toEnvelope) {
        const err = new Error();
        err.status = 404;
        return next(err);
    }
    req.toCategory = toCategory;
    req.toEnvelope = toEnvelope;
    next();
});

app.get("/envelopes", (req, res, next) => {
    res.send(envelopes);
});

app.post("/envelopes", (req, res, next) => {
    const category = req.query.category;
    const balance = Number(req.query.balance);
    if (!category || balance === null) {
        const err = new Error();
        err.status = 400;
        return next(err);
    }

    const envelope = { balance: balance };
    envelopes[category] = envelope;
    res.send(envelope);
});

app.get("/envelopes/:category", (req, res, next) => {
    res.send(req.envelope);
});

app.put("/envelopes/:category", (req, res, next) => {
    const balance = Number(req.query.balance);

    if (balance === null || balance < 0) {
        const err = new Error();
        err.status = 400;
        return next(err);
    }

    req.envelope.balance = balance;
    res.send(req.envelope);
});

app.post("/envelopes/withdraw/:category", (req, res, next) => {
    const amount = Number(req.query.amount);
    if (amount === null || req.envelope.balance < amount) {
        const err = new Error();
        err.status = 400;
        return next(err);
    }

    req.envelope.balance -= amount;
    res.send(req.envelope);
});

app.delete("/envelopes/:category", (req, res, next) => {
    delete envelopes[req.category];
    res.status(204).send();
});

app.post("/envelopes/transfer/:fromCategory/:toCategory", (req, res, next) => {
    const amount = Number(req.query.amount);
    if (amount === null || req.fromEnvelope.balance < amount) {
        const err = new Error();
        err.status = 400;
        return next(err);
    }

    req.fromEnvelope.balance -= amount;
    req.toEnvelope.balance += amount;

    res.send({
        [req.fromCategory]: req.fromEnvelope,
        [req.toCategory]: req.toEnvelope,
    });
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).send(err.message);
});
