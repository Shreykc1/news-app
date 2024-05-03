import React, { useState, useEffect } from 'react';
// import './App.css';
import './App.module.css';

const App = () => {
  const [news, setNews] = useState([]);
  const [images, setImages] = useState({});

  useEffect(() => {
    fetch('https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ftechcrunch.com%2Ffeed%2F')
      .then(response => response.json())
      .then(data => {
        setNews(data.items);
        // Fetch images for each news item and wait for all promises to resolve
        Promise.all(data.items.map(item => fetchImage(item.title)))
          .then(urls => {
            // Update images state with all resolved URLs
            setImages(prevImages => urls.reduce((acc, url, index) => {
              acc[data.items[index].guid] = url;
              return acc;
            }, {}));
          });
      });
  }, []);


  const fetchImage = async (title) => {
    try {
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${title}&client_id=0zX6JyXFcILkqO1BUPKjKWMOcFCi17dxeXg20V9VeG0`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {

        return data.results[0].urls.regular;
      } else {
        console.log("No images found for the search query:", title);
        return '';
      }
    } catch (error) {

      console.error("Error fetching image:", error);
      return '';
    }
  };

  let wordsToRemove = ["<p>", "</p>"];

  let regex = new RegExp(wordsToRemove.join('|'), 'gi');
  return (
    <div className="container">
      <h1>News Daily</h1>
      <ul>
        {news.map(item => (
          <li key={item.guid}>
            <center><h2>{item.title}</h2></center>
            {images[item.guid] && <center><img src={images[item.guid]} alt={item.title} /></center>}
            <p>{item.pubDate}</p>
            <p>{item.description.replace(regex, '').split(/\s+/)
              .reverse()
              .slice(11)
              .reverse()
              .join(' ')
              .trim()}</p>
            <a href={item.link} target="_blank" rel="noopener noreferrer">Read more</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
