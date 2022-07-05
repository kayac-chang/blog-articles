# Dependencies and setup window

## 準備套件

在一開始我們保持簡單就好了。

```rust
[dependencies]
env_logger = "0.9.0"
log = "0.4.16"
pollster = "0.2.5"
wgpu = "0.12.0"
winit = "0.26.1"
```

## env_logger

`env_logger::init();` 這行非常重要，我們需要它來啟用 log。
不然當 wgpu 發生錯誤，他只會給你一些很籠統的訊息。
我們要打開它來取得真實的錯誤資訊。

## 建立視窗

-- `lib.rs`

```rust
use winit::{
    event::*,
    event_loop::{ControlFlow, EventLoop},
    window::WindowBuilder,
};

pub async fn run() {
    env_logger::init();
    let event_loop = EventLoop::new();
    let window = WindowBuilder::new().build(&event_loop).unwrap();

    event_loop.run(move |event, _, control_flow| match event {
        Event::WindowEvent {
            ref event,
            window_id,
        } if window_id == window.id() => match event {
            WindowEvent::CloseRequested
            | WindowEvent::KeyboardInput {
                input:
                    KeyboardInput {
                        state: ElementState::Pressed,
                        virtual_keycode: Some(VirtualKeyCode::Escape),
                        ..
                    },
                ..
            } => *control_flow = ControlFlow::Exit,
            _ => {}
        },
        _ => {}
    });
}
```

-- `main.rs`

```rust
use pollster;
use wgpu_playground::run;

fn main() {
    pollster::block_on(run());
}
```

-- terminal

```sh
cargo run
```

## 支援 web

```toml
[lib]
crate-type = ["cdylib", "rlib"]
```

這些是告訴 `cargo` 編譯出兩個版本，

- `rlib`: native Rust static library 給桌面應用
- `cdylib`: C/C++ compatible library 給 Web Assembly

針對發佈到 Web，我們還需要一些東西：

```toml
[dependencies]
cfg-if = "1"
# the other regular dependencies...

[target.'cfg(target_arch = "wasm32")'.dependencies]
console_error_panic_hook = "0.1.6"
console_log = "0.2.0"
wgpu = { version = "0.12", features = ["webgl"]}
wasm-bindgen = "0.2.76"
web-sys = { version = "0.3.53", features = [
    "Document",
    "Window",
    "Element",
]}
```

- `cfg_if`: 負責針對不同平台產生不同的程式
- `[target.'cfg(target_arch = "wasm32")'.dependencies]`: 當編譯 `wasm32` 的時候才包含以下的套件
- `console_error_panic_hook`: 當我們 `panic!` 的時候，輸出 error 給 JS
- `console_log`: 我們使用 `log` 的時候，輸出到 `console.log`
- `wgpu`: 我們暫時用 `webgl` 因為 `webGPU` 還沒 stable
- `wasm-bindgen`: 最重要的，我們要用 `wasm` 讓兩套程式語言可以溝通
- `web-sys`: 包含了一些基本的 web api，像是 `get_element_by_id`, `append_child`
