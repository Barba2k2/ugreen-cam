use crate::uvc::uvc_error::UvcError;

/// USB transfers and file writes block, so commands hand their work to the blocking pool.
pub struct BlockingTask;

impl BlockingTask {
    pub async fn run<T: Send + 'static>(
        task: impl FnOnce() -> Result<T, UvcError> + Send + 'static,
    ) -> Result<T, UvcError> {
        tauri::async_runtime::spawn_blocking(task)
            .await
            .map_err(|error| UvcError::Worker(error.to_string()))?
    }
}
