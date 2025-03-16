export function formatImagePath(path: string): string {
  if (!path) {
    return '/placeholder.svg';
  }
  
  // If it's already a URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Use environment variable for API URL, fallback to localhost for development
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
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
    return `${apiBaseUrl}/${relativePath}`;
  }
  
  // Default case: assume it's a relative path from the uploads directory
  return `${apiBaseUrl}/uploads/${formattedPath}`;
}