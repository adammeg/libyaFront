export function formatImagePath(path: string): string {
  if (!path) {
    console.log('Empty path provided to formatImagePath');
    return '/placeholder.svg';
  }
  
  // If it's already a URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  try {
    // Use environment variable for API URL, fallback to localhost for development
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    console.log(`Formatting image path: ${path} with base URL: ${apiBaseUrl}`);
    
    // If it's a relative path, make it absolute
    if (path.startsWith('/')) {
      return `${apiBaseUrl}${path}`;
    }
    
    // Handle Windows-style paths
    const formattedPath = path.replace(/\\/g, '/');
    
    // If it includes 'uploads', extract that part
    if (formattedPath.includes('uploads/')) {
      const uploadsIndex = formattedPath.indexOf('uploads/');
      const relativePath = formattedPath.substring(uploadsIndex);
      const fullUrl = `${apiBaseUrl}/${relativePath}`;
      console.log(`Formatted image URL: ${fullUrl}`);
      return fullUrl;
    }
    
    // Default case: assume it's a relative path from the uploads directory
    const fullUrl = `${apiBaseUrl}/uploads/${formattedPath}`;
    console.log(`Formatted image URL: ${fullUrl}`);
    return fullUrl;
  } catch (error) {
    console.error('Error formatting image path:', error);
    return '/placeholder.svg';
  }
}