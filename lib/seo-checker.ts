// lib/seo-checker.ts
import { Metadata } from 'next';

interface SeoAnalysis {
    score: number;
    issues: string[];
    suggestions: string[];
    passed: string[];
}

export function analyzeSeoMetadata(metadata: Metadata): SeoAnalysis {
    const issues: string[] = [];
    const suggestions: string[] = [];
    const passed: string[] = [];
    let score = 0;

    // Title Analysis
    if (metadata.title) {
        const titleText = typeof metadata.title === 'string' 
            ? metadata.title 
            : metadata.title.default || '';
        
        if (titleText.length > 0) {
            passed.push('✅ Title is present');
            score += 15;
            
            if (titleText.length >= 30 && titleText.length <= 60) {
                passed.push('✅ Title length is optimal (30-60 chars)');
                score += 10;
            } else if (titleText.length < 30) {
                suggestions.push('💡 Consider making title longer (30-60 chars recommended)');
            } else if (titleText.length > 60) {
                issues.push('⚠️ Title is too long (over 60 chars)');
            }
        } else {
            issues.push('❌ Title is missing');
        }
    } else {
        issues.push('❌ Title is missing');
    }

    // Description Analysis
    if (metadata.description) {
        passed.push('✅ Description is present');
        score += 15;
        
        if (metadata.description.length >= 120 && metadata.description.length <= 160) {
            passed.push('✅ Description length is optimal (120-160 chars)');
            score += 10;
        } else if (metadata.description.length < 120) {
            suggestions.push('💡 Consider making description longer (120-160 chars recommended)');
        } else if (metadata.description.length > 160) {
            issues.push('⚠️ Description is too long (over 160 chars)');
        }
    } else {
        issues.push('❌ Description is missing');
    }

    // Keywords Analysis
    if (metadata.keywords && Array.isArray(metadata.keywords) && metadata.keywords.length > 0) {
        passed.push('✅ Keywords are present');
        score += 10;
        
        if (metadata.keywords.length >= 5 && metadata.keywords.length <= 15) {
            passed.push('✅ Optimal number of keywords (5-15)');
            score += 5;
        } else if (metadata.keywords.length < 5) {
            suggestions.push('💡 Consider adding more keywords (5-15 recommended)');
        } else {
            suggestions.push('💡 Consider reducing number of keywords (5-15 recommended)');
        }
    } else {
        suggestions.push('💡 Consider adding keywords for better SEO');
    }

    // OpenGraph Analysis
    if (metadata.openGraph) {
        passed.push('✅ OpenGraph tags are present');
        score += 15;
        
        if (metadata.openGraph.images && metadata.openGraph.images.length > 0) {
            passed.push('✅ OpenGraph image is present');
            score += 10;
        } else {
            suggestions.push('💡 Add OpenGraph image for better social sharing');
        }
        
        if (metadata.openGraph.url) {
            passed.push('✅ OpenGraph URL is present');
            score += 5;
        } else {
            suggestions.push('💡 Add OpenGraph URL');
        }
    } else {
        issues.push('❌ OpenGraph tags are missing');
    }

    // Twitter Card Analysis
    if (metadata.twitter) {
        passed.push('✅ Twitter Card tags are present');
        score += 10;
        
        if (metadata.twitter.images && metadata.twitter.images.length > 0) {
            passed.push('✅ Twitter image is present');
            score += 5;
        } else {
            suggestions.push('💡 Add Twitter Card image');
        }
    } else {
        suggestions.push('💡 Add Twitter Card tags for better social sharing');
    }

    // Canonical URL Analysis
    if (metadata.alternates?.canonical) {
        passed.push('✅ Canonical URL is present');
        score += 10;
    } else {
        suggestions.push('💡 Add canonical URL to prevent duplicate content issues');
    }

    // Robots Analysis
    if (metadata.robots) {
        passed.push('✅ Robots directives are present');
        score += 5;
    } else {
        suggestions.push('💡 Add robots meta tags for better crawling control');
    }

    return {
        score: Math.min(100, score),
        issues,
        suggestions,
        passed
    };
}

export function getSeoRecommendations(pagePath: string): string[] {
    const recommendations: string[] = [];

    // Page-specific recommendations
    if (pagePath.includes('/dashboard')) {
        recommendations.push('Add structured data for business dashboard');
        recommendations.push('Include performance metrics in meta description');
    }

    if (pagePath.includes('/pos')) {
        recommendations.push('Highlight speed and efficiency in meta tags');
        recommendations.push('Include transaction processing keywords');
    }

    if (pagePath.includes('/products')) {
        recommendations.push('Use inventory management related keywords');
        recommendations.push('Mention product catalog features');
    }

    if (pagePath.includes('/orders')) {
        recommendations.push('Focus on order management capabilities');
        recommendations.push('Include order tracking keywords');
    }

    // General recommendations
    recommendations.push('Ensure all images have alt tags');
    recommendations.push('Use semantic HTML structure');
    recommendations.push('Optimize page loading speed');
    recommendations.push('Test mobile responsiveness');
    recommendations.push('Implement breadcrumb navigation');

    return recommendations;
}

// Development helper to log SEO analysis
export function logSeoAnalysis(metadata: Metadata, pagePath: string) {
    if (process.env.NODE_ENV === 'development') {
        const analysis = analyzeSeoMetadata(metadata);
        console.group(`🔍 SEO Analysis for ${pagePath}`);
        console.log(`Score: ${analysis.score}/100`);
        
        if (analysis.passed.length > 0) {
            console.group('✅ Passed');
            analysis.passed.forEach(item => console.log(item));
            console.groupEnd();
        }
        
        if (analysis.issues.length > 0) {
            console.group('❌ Issues');
            analysis.issues.forEach(item => console.log(item));
            console.groupEnd();
        }
        
        if (analysis.suggestions.length > 0) {
            console.group('💡 Suggestions');
            analysis.suggestions.forEach(item => console.log(item));
            console.groupEnd();
        }
        
        const recommendations = getSeoRecommendations(pagePath);
        if (recommendations.length > 0) {
            console.group('📋 Recommendations');
            recommendations.forEach(item => console.log(item));
            console.groupEnd();
        }
        
        console.groupEnd();
    }
}