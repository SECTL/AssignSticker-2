// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_system_fonts() -> Vec<String> {
    let mut fonts = std::collections::HashSet::new();
    let home = std::env::var("HOME").unwrap_or_default();
    let dirs: Vec<String> = vec![
        "/System/Library/Fonts".to_string(),
        "/Library/Fonts".to_string(),
        format!("{}/Library/Fonts", home),
    ];
    for dir in &dirs {
        if let Ok(entries) = std::fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if let Some(ext) = path.extension() {
                    let ext = ext.to_string_lossy().to_lowercase();
                    if ext == "ttf" || ext == "otf" || ext == "ttc" {
                        if let Some(stem) = path.file_stem() {
                            fonts.insert(stem.to_string_lossy().to_string());
                        }
                    }
                }
            }
        }
    }
    let mut result: Vec<String> = fonts.into_iter().collect();
    result.sort();
    result
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_system_fonts])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
