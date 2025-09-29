#!/usr/bin/env node

// Quick SEO Test Script
// Run with: node seo-test.js

const https = require('https');
const http = require('http');

const testUrl = process.argv[2] || 'http://localhost:3000';

console.log(`🔍 Testing SEO for: ${testUrl}`);
console.log('=' .repeat(50));

function testEndpoint(path, description) {
    return new Promise((resolve) => {
        const url = new URL(path, testUrl);
        const client = url.protocol === 'https:' ? https : http;
        
        const req = client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`\n📄 ${description}`);
                console.log(`Status: ${res.statusCode}`);
                
                // Check for meta tags
                const titleMatch = data.match(/<title[^>]*>(.*?)<\/title>/i);
                const descMatch = data.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
                const ogTitleMatch = data.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
                const ogImageMatch = data.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);
                const jsonLdMatch = data.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/i);
                
                console.log(`Title: ${titleMatch ? titleMatch[1] : '❌ Missing'}`);
                console.log(`Description: ${descMatch ? `✅ ${descMatch[1].substring(0, 80)}...` : '❌ Missing'}`);
                console.log(`OG Title: ${ogTitleMatch ? '✅ Present' : '❌ Missing'}`);
                console.log(`OG Image: ${ogImageMatch ? '✅ Present' : '❌ Missing'}`);
                console.log(`Structured Data: ${jsonLdMatch ? '✅ Present' : '❌ Missing'}`);
                
                resolve();
            });
        });
        
        req.on('error', () => {
            console.log(`❌ Failed to test ${path}`);
            resolve();
        });
    });
}

async function runTests() {
    const testPaths = [
        ['/', 'Homepage'],
        ['/dashboard', 'Dashboard'],
        ['/(apps)/pos', 'POS Terminal'],
        ['/(apps)/products', 'Products'],
        ['/(apps)/orders', 'Orders'],
        ['/(apps)/sitemap.xml', 'Sitemap'],
        ['/(apps)/robots.txt', 'Robots.txt']
    ];
    
    for (const [path, description] of testPaths) {
        await testEndpoint(path, description);
    }
    
    console.log('\n🎯 SEO Quick Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Test with Google PageSpeed Insights');
    console.log('2. Validate social sharing with Facebook Debugger');
    console.log('3. Submit sitemap to Google Search Console');
    console.log('4. Add actual OG images to /public/images/ folder');
}

runTests().catch(console.error);