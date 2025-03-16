/**
 * Formats an image path to ensure it's properly accessible
 * @param imagePath The original image path from the API
 * @returns Properly formatted image URL
 */
export function formatImagePath(path: string): string {
  console.log("formatImagePath input:", path);
  
  if (!path) {
    console.log("Empty path, returning placeholder");
    return '/placeholder.svg';
  }
  
  // If it's already a URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    console.log("Path is already a URL, returning as-is");
    return path;
  }
  
  // If it's a relative path, make it absolute
  if (path.startsWith('/')) {
    const result = `http://localhost:5000${path}`;
    console.log("Path starts with /, returning:", result);
    return result;
  }
  
  // Handle Windows-style paths
  const formattedPath = path.replace(/\\/g, '/');
  console.log("After normalizing backslashes:", formattedPath);
  
  // If it includes 'uploads', extract that part
  if (formattedPath.includes('uploads/')) {
    const uploadsIndex = formattedPath.indexOf('uploads/');
    const relativePath = formattedPath.substring(uploadsIndex);
    const result = `http://localhost:5000/${relativePath}`;
    console.log("Path includes 'uploads/', returning:", result);
    return result;
  }
  
  // Default case: assume it's a relative path from the uploads directory
  const result = `http://localhost:5000/uploads/${formattedPath}`;
  console.log("Default case, returning:", result);
  return result;
} 