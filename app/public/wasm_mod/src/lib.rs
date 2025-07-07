use wasm_bindgen::prelude::*;


#[wasm_bindgen]
pub fn add(left: u16, right: u16) -> u16 {
    left + right
}

