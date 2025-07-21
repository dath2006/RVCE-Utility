import SitemapGenerator from "sitemap-generator";

// Replace with your actual website URL
const generator = SitemapGenerator(
  "https://rvce-utility.vercel.app/resources",
  {
    stripQuerystring: false,
  }
);

// Register event listeners
generator.on("done", () => {
  console.log("Sitemap generated!");
});

// Start the crawler
generator.start();
