resource_manifest_version "44febabe-d386-4d18-afbe-5e627f4af937"

dependency "vrp"

server_script {
    "@vrp/lib/utils.lua",
    "vrp_s.lua"
}

client_script {
    "@vrp/lib/utils.lua",
    "client.lua"
}

ui_page "html/index.html"

files {
    "html/index.html",
    "html/styles.css",
    "html/app.js"
}
