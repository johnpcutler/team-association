#!/usr/bin/env python3
"""
Generate a standalone PDF from the Org Sensing data.
Requires: pip install weasyprint
"""

import json
from pathlib import Path
from datetime import datetime

try:
    from weasyprint import HTML, CSS
except ImportError:
    print("Error: weasyprint not installed. Install with: pip install weasyprint")
    exit(1)

def generate_pdf():
    # Load data
    with open('data.json', 'r', encoding='utf-8') as f:
        sections = json.load(f)
    
    # Generate HTML
    timestamp_str = datetime.now().strftime('%B %d, %Y at %I:%M %p')
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{
                size: letter;
                margin: 0.5in;
                @top-center {{
                    content: "https://johnpcutler.github.io/team-association/";
                    font-size: 10px;
                    color: #6b7280;
                    font-family: 'Helvetica', 'Arial', sans-serif;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 8px;
                    margin-bottom: 10px;
                }}
                @bottom-center {{
                    content: "Page " counter(page);
                    font-size: 10px;
                    color: #6b7280;
                    font-family: 'Helvetica', 'Arial', sans-serif;
                }}
            }}
            body {{
                font-family: 'Helvetica', 'Arial', sans-serif;
                color: #111827;
                line-height: 1.6;
            }}
            .header {{
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #d1d5db;
            }}
            .header h1 {{
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #111827;
            }}
            .header p {{
                font-size: 13px;
                color: #374151;
                margin-bottom: 6px;
                line-height: 1.5;
            }}
            .timestamp {{
                font-size: 11px;
                color: #6b7280;
            }}
            .section {{
                page-break-inside: avoid;
                page-break-after: always;
                margin-bottom: 0;
                border: 1px solid #e5e7eb;
                min-height: 0;
            }}
            .section:last-child {{
                page-break-after: auto;
            }}
            .section-header {{
                background: #2563eb;
                color: white;
                padding: 12px;
            }}
            .section-header h2 {{
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 6px;
                margin: 0 0 6px 0;
            }}
            .section-header .question {{
                color: #bfdbfe;
                font-size: 14px;
                margin: 0;
                line-height: 1.4;
            }}
            .section-items {{
                padding: 12px;
                background: #f9fafb;
            }}
            .item {{
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 1px solid #e5e7eb;
            }}
            .item:last-child {{
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }}
            .item h3 {{
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 4px;
                color: #111827;
                line-height: 1.3;
            }}
            .item p {{
                font-size: 12px;
                color: #374151;
                margin: 0;
                line-height: 1.4;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Org Sensing</h1>
            <p>Consider a team, group, or department in your company. Use the prompts and options below to explore different frames and lenses that might help you describe how it operates.</p>
            <p class="url" style="font-size: 11px; color: #2563eb; margin-top: 8px; margin-bottom: 6px;">https://johnpcutler.github.io/team-association/</p>
            <p class="timestamp">Generated on {timestamp_str}</p>
        </div>
    """
    
    # Add sections
    for section in sections:
        html_content += f"""
        <div class="section">
            <div class="section-header">
                <h2>{section['title']}</h2>
        """
        
        if 'question' in section:
            html_content += f'<p class="question">{section["question"]}</p>'
        
        html_content += """
            </div>
            <div class="section-items">
        """
        
        for item in section['items']:
            html_content += f"""
                <div class="item">
                    <h3>{item['principle']}</h3>
                    <p>{item['description']}</p>
                </div>
            """
        
        html_content += """
            </div>
        </div>
        """
    
    html_content += """
    </body>
    </html>
    """
    
    # Generate PDF
    output_file = "org-sensing.pdf"
    HTML(string=html_content).write_pdf(output_file)
    
    print(f"PDF generated successfully: {output_file}")
    return output_file

if __name__ == '__main__':
    generate_pdf()
