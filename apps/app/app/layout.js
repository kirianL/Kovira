import "./globals.css";

export const metadata = {
  title: "Kovira — Dashboard",
  description: "Kovira SaaS workspace — forms, submissions, workflows, analytics",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/tabler-icons/3.1.0/iconfont/tabler-icons.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
