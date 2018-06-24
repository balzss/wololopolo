#![feature(plugin)]
#![plugin(rocket_codegen)]

extern crate rocket;
extern crate rocket_contrib;

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use rocket::response::Redirect;
use rocket::response::NamedFile;
use rocket_contrib::Template;

#[cfg(debug_assertions)]
const DOMAIN : &str = "http://localhost:8000/";

#[cfg(not(debug_assertions))]
const DOMAIN : &str = "https://wololopolo.com/";

#[get("/", rank = 1)]
fn index() -> Template {
    let mut context = HashMap::new();
    context.insert("static_server", "false");
    Template::render("index", &context)
}

#[get("/static/<file..>", rank = 2)]
fn files(file: PathBuf) -> Option<NamedFile> {
    NamedFile::open(Path::new("static/").join(file)).ok()
}

#[get("/<text>/<color>/<font>", rank = 3)]
fn text_color_font(text: String, color: String, font: String) -> Redirect {
    Redirect::to(&format!("{}?txt={}&color={}&font={}", DOMAIN, text, color, font))
}

#[get("/<text>/<color>", rank = 4)]
fn text_color(text: String, color: String) -> Redirect {
    Redirect::to(&format!("{}?txt={}&color={}", DOMAIN, text, color))
}

#[get("/<text>", rank = 5)]
fn text_only(text: String) -> Redirect {
    Redirect::to(&format!("{}?txt={}", DOMAIN, text))
}

fn main() {
    rocket::ignite()
        .mount("/", routes![index, files, text_only, text_color, text_color_font])
        .attach(Template::fairing())
        .launch();
}
