import time
from logger import warn, error, debug

def retry_with_backoff(func, max_retries=3, initial_delay=1, backoff_factor=2):
    """
    Retry a function with exponential backoff
    
    Args:
        func: Function to retry (callable)
        max_retries: Maximum number of retry attempts
        initial_delay: Initial delay in seconds
        backoff_factor: Multiply delay by this after each retry
    
    Returns:
        Result of the function if successful, None if all retries fail
    """
    delay = initial_delay
    attempt = 0
    
    while attempt < max_retries:
        try:
            debug(f"Attempt {attempt + 1}/{max_retries} for {func.__name__}")
            return func()
        except Exception as e:
            attempt += 1
            if attempt >= max_retries:
                error(f"Failed after {max_retries} attempts: {str(e)}")
                raise
            
            warn(f"Attempt {attempt} failed: {str(e)}. Retrying in {delay}s...")
            time.sleep(delay)
            delay *= backoff_factor
    
    return None