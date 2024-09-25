const express = require('express');
const axios = require('axios');
const path = require('path');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());

// API endpoint
app.get('/api/data', async (req, res) => {
  try {
    const response = await axios.get('https://api.coindesk.com/v1/bpi/currentprice.json');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/data2', async (req, res) => {
    console.log('Received request for data');
    try {
      const response = await axios.get('https://api.coindesk.com/v1/bpi/currentprice.json');
      console.log('Data fetched successfully:', response.data);
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  });

  app.get('/api/fv-data', async (req, res) => {
    try {
      // Načítanie HTML zo stránky
      const { data } = await axios.get('https://www.sunnyportal.com/Templates/PublicPage.aspx?page=54371cfb-39c8-4a45-9019-79241ad62cb0');
      const $ = cheerio.load(data);
  
      // Extrahovanie údajov
      const fvPerformance = $('.mainValueAmount[data-value]').attr('data-value') || 'N/A'; // Aktuálny FV výkon
      const energyToday = $('#ctl00_ContentPlaceHolder1_PublicPagePlaceholder1_PageUserControl_ctl00_PublicPageLoadFixPage_energyYieldWidget_energyYieldValue').text() || 'N/A'; // Energia dnes
      const totalEnergy = $('#ctl00_ContentPlaceHolder1_PublicPagePlaceholder1_PageUserControl_ctl00_PublicPageLoadFixPage_energyYieldWidget_energyYieldTotalValue').text() || 'N/A'; // Celková energia
      const co2Today = $('#ctl00_ContentPlaceHolder1_PublicPagePlaceholder1_PageUserControl_ctl00_PublicPageLoadFixPage_carbonWidget_carbonReductionValue').text() || 'N/A'; // CO2 dnes
      const co2Total = $('#ctl00_ContentPlaceHolder1_PublicPagePlaceholder1_PageUserControl_ctl00_PublicPageLoadFixPage_carbonWidget_carbonReductionTotalValue').text() || 'N/A'; // Celková eliminácia CO2
  
      // Správne naformátovanie informácií o FV systéme
      const systemPower = $('.widgetBox[data-name="plantInfo"] .mainValue').find('strong').first().text().trim();
      const batteryCapacity = $('.widgetBox[data-name="plantInfo"] .mainValue').find('strong').last().text().trim();
  
      // Naformátovanie výstupu pre systemInfo
      const systemInfo = {
        "PV system power": systemPower,
        "Nominal battery capacity": batteryCapacity
      };
  
      // Poslanie dát do frontendu
      res.json({
        fvPerformance: `${fvPerformance} W`,
        energyToday: `${energyToday} Wh`,
        totalEnergy: `${totalEnergy} MWh`,
        co2Today: `${co2Today} kg`,
        co2Total: `${co2Total} t`,
        systemInfo
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  });
  
  

// Serve React frontend
app.use(express.static(path.join(__dirname, '../energy-app/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../energy-app/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
