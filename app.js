const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy; // class/object untuk memakai passport google oauth

const app = express();

app.use(session({ // untuk mengintegrasikan express-session (session) dengan express (app) sehingga web server nantinya bisa menggunakan session
    secret: "secret-key",
    resave: false, 
    saveUninitialized: true
}));

app.set("view engine", "ejs"); // mengindikasikan bahwa kita menggunakan template engine ejs

app.use(passport.initialize()); // menginisialisasi passport, mengintegrasikan dengan passport sehingga web server express bisa menggunakan library passport
app.use(passport.session());

passport.use(new GoogleStrategy({ // menggunakan passport untuk GoogleStrategy
    clientID: "", 
    clientSecret: "", 
    callbackURL: "",
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => { // untuk mengintegrasikan session ke passport (kalau berhasil login dengan google melalui passport, akan dibuatkan session otomatis menggunakan function serializeUser)
    done(null, user);
});
passport.deserializeUser((obj, done) => { // untuk menghapus session ketika logout secara otomatis
    done(null, obj);
});

app.get("/", (req, res) => { // default route nya (root url nya pakai /)
    res.render('index'); // merender sebuah file bernama index yang terletak di folder views
});

app.get("/auth/google", // ketika mengarah ke /auth/google, maka akan dijalankan passport untuk membuat authentication with google
    passport.authenticate("google", {
        scope: ["profile", "email"], // menyatakan apa saja yang ingin diakses oleh aplikasi agar user tau (sesuai yang diregistrasikan pada google console)
        prompt: "select_account", // memberikan prompt agar user memilih mau login dengan account google yang mana
    })
);

app.get("/auth/google/callback", 
    passport.authenticate("google", {failureRedirect: "/"}), // jika ternyata proses login with google gagal, maka akan diarahkan ke URL "/" (root url kembali ke index)
    (req, res) => {
        res.redirect("/profile"); // kalau berhasil login, akan diarahkan ke URL "/profile"
    }
);

app.get("/profile", (req, res) => {
    if (!req.isAuthenticated()) { // memeriksa apakah user sudah login
        return res.redirect("/auth/google"); // jika belum, akan diarahkan ke sign in with google lagi
    }
    res.render("profile", { user: req.user }); // jika sudah, akan merender file bernama profile dengan mengirim object user (hasil dari sign in with google)
});

app.get("/logout", (req, res) => {
    req.logout(err => {
        if (err) return next(err); // jika ada error, akan dimunculkan errornya
        res.redirect("/"); // jika tidak error, akan redirect ke URL "/" (home/index)
    });
});

app.listen(3000, () => { // untuk menjalankan servernya (3000 adalah nama portnya)
    console.log("Server is running on port 3000");
});