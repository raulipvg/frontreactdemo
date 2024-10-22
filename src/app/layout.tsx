
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
})  {
  return (
    <html lang="es">
      <body>{children}</body>
      
    </html>
  )
}