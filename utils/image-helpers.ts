/**
 * Formats an image path to ensure it's properly accessible
 * @param imagePath The original image path from the API
 * @returns Properly formatted image URL
 */
export function formatImagePath(path: string): string {
  if (!path) return '/placeholder.svg';
  
  // If it's already a URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a relative path, make it absolute
  if (path.startsWith('/')) {
    return `http://localhost:5000${path}`;
  }
  
  // Handle Windows-style paths
  const formattedPath = path.replace(/\\/g, '/');
  
  // If it includes 'uploads', extract that part
  if (formattedPath.includes('uploads/')) {
    const uploadsIndex = formattedPath.indexOf('uploads/');
    const relativePath = formattedPath.substring(uploadsIndex);
    return `http://localhost:5000/${relativePath}`;
  }
  
  // Default case: assume it's a relative path from the uploads directory
  return `http://localhost:5000/uploads/${formattedPath}`;
} 