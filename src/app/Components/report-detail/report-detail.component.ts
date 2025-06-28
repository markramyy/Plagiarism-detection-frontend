import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.component.html',
  styleUrls: ['./report-detail.component.css']
})
export class ReportDetailComponent implements OnInit {
  report: any = null;
  loading = false;
  error: string | null = null;

  // UI state properties
  comparisonView: 'side-by-side' | 'unified' = 'side-by-side';
  showTechnicalDetails = false;
  expandedSegments: boolean[] = [];
  highlightedSuspiciousText = '';
  highlightedSourceText = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit(): void {
    const reportId = this.route.snapshot.paramMap.get('id');
    if (reportId) {
      this.loadReport(reportId);
    }
  }

  loadReport(reportId: string): void {
    this.loading = true;
    this.error = null;

    // Mock data based on the provided sample response
    setTimeout(() => {
      this.report = {
        guid: reportId,
        check_type: "file_to_file",
        check_type_display: "File to File",
        verdict: "MID",
        verdict_display: "MID plagiarism risk",
        overall_score: 51.26,
        formatted_score: "51.26%",
        is_plagiarized: true,
        is_high_risk: false,
        confidence: 0.5126,
        suspicious_text: "The Renaissance era represented a time of cultural, artistic, political and economic revival that began in Italy during the 14th century. It signified the shift from medieval times to the early modern period. During the Renaissance, there were developments in linear perspective for painting, progress in anatomical and astronomical studies, and the growth of humanist thinking.\n\nImportant Renaissance personalities included Leonardo da Vinci, Michelangelo, Raphael, and Donatello in the arts; Nicolaus Copernicus and Galileo Galilei in scientific fields; and Niccolò Machiavelli in political theory. The creation of the printing press by Johannes Gutenberg circa 1440 was essential for distributing Renaissance concepts across Europe.\n\nThe Renaissance focus on personal accomplishment and human capability stood in stark contrast to the medieval emphasis on religious dedication and group identity. This transformation established the foundation for the Scientific Revolution and Enlightenment periods that came later.",
        source_text: "The Renaissance was a period of cultural, artistic, political and economic renewal beginning in Italy in the 14th century. It marked the transition from the medieval period to the early modern age. The Renaissance saw the development of linear perspective in painting, advances in anatomy and astronomy, and the flourishing of humanist philosophy.\n\nKey figures of the Renaissance include Leonardo da Vinci, Michelangelo, Raphael, and Donatello in art; Nicolaus Copernicus and Galileo Galilei in science; and Niccolò Machiavelli in political philosophy. The invention of the printing press by Johannes Gutenberg around 1440 was crucial in spreading Renaissance ideas throughout Europe.\n\nThe Renaissance emphasis on individual achievement and human potential contrasted sharply with the medieval focus on religious devotion and collective identity. This shift laid the groundwork for the Scientific Revolution and the Enlightenment that would follow.",
        processing_time: 127.859867811203,
        notes: null,
        created: "2025-06-27T09:22:12.387401Z",
        modified: "2025-06-27T09:22:12.387445Z",
        component_scores: [
          {
            guid: "1e389b71-fd8a-442f-a8b9-d87ab2718349",
            component_type: "structural",
            component_display: "Structural Similarity (LSTM1)",
            score: 42.66,
            formatted_score: "42.66%",
            weight: 0.3
          },
          {
            guid: "34c281e8-834e-4bf4-bf94-9606d03330c5",
            component_type: "semantic",
            component_display: "Semantic Similarity (LSTM2)",
            score: 6.7,
            formatted_score: "6.70%",
            weight: 0.3
          },
          {
            guid: "80ab26df-58fc-4615-a0bb-5c46f3eb1853",
            component_type: "meaning",
            component_display: "Meaning Similarity (BERT)",
            score: 99.29,
            formatted_score: "99.29%",
            weight: 0.2
          },
          {
            guid: "1c0926b1-72aa-4e77-9250-71410cdd0906",
            component_type: "exact",
            component_display: "Exact Similarity (TF-IDF)",
            score: 83,
            formatted_score: "83.00%",
            weight: 0.2
          }
        ],
        analysis_insights: [
          {
            guid: "66811232-e33d-4d9f-a48f-1868e057f038",
            insight: "Significant similarities found",
            order: 0
          },
          {
            guid: "e6837e51-359f-4b54-a4ed-fa5dc28b5ec1",
            insight: "High word-for-word similarity detected",
            order: 1
          },
          {
            guid: "6a8ac67a-60ea-4a71-a3c3-e136aa7a1182",
            insight: "Ideas and meanings are essentially identical",
            order: 2
          }
        ],
        explanations: [
          {
            guid: "d28be3e1-c10a-4f84-a6db-11f451e93fff",
            explanation: "High similarity detected in: Exact text similarity: 83.0%, Meaning similarity: 99.29%",
            order: 0
          },
          {
            guid: "a345475e-cdc0-48a5-a1d9-8f0cb1ad059b",
            explanation: "Strongest match: 83.0% similarity found",
            order: 1
          }
        ],
        matching_segments: [
          {
            guid: "06753fa2-b8ac-4a81-88f2-e8e8e9045e9d",
            source_segment: "The Renaissance was a period of cultural, artistic, political and economic renewal beginning in Italy in the 14th century.",
            suspect_segment: "The Renaissance era represented a time of cultural, artistic, political and economic revival that began in Italy during the 14th century.",
            similarity_score: 83,
            formatted_similarity: "83.00%",
            is_high_similarity: false,
            position_source: 1,
            position_suspect: 1
          },
          {
            guid: "2765ac8c-4fc1-4f68-8c3e-01f492d079b2",
            source_segment: "The invention of the printing press by Johannes Gutenberg around 1440 was crucial in spreading Renaissance ideas throughout Europe.",
            suspect_segment: "The creation of the printing press by Johannes Gutenberg circa 1440 was essential for distributing Renaissance concepts across Europe.",
            similarity_score: 76.05,
            formatted_similarity: "76.05%",
            is_high_similarity: false,
            position_source: 5,
            position_suspect: 5
          }
        ],
        suspicious_file_detail: {
          guid: "814aee91-4237-45cc-8d0e-20a0774993d6",
          file: "http://localhost:8000/uploads/sample_suspicious.txt",
          file_type: "txt",
          zip_folder: null
        },
        source_file_detail: {
          guid: "f5517714-cb90-4195-acda-26931aaeb284",
          file: "http://localhost:8000/uploads/sample_source_Ts5EkVu.txt",
          file_type: "txt",
          zip_folder: null
        }
      };

      this.highlightedSuspiciousText = this.report.suspicious_text;
      this.highlightedSourceText = this.report.source_text;
      this.expandedSegments = new Array(this.report.matching_segments.length).fill(false);
      this.loading = false;
    }, 500);
  }

  getVerdictClass(verdict: string): string {
    const classes: { [key: string]: string } = {
      'LOW': 'verdict-low',
      'MID_LOW': 'verdict-mid-low',
      'MID': 'verdict-mid',
      'MID_HIGH': 'verdict-mid-high',
      'HIGH': 'verdict-high'
    };
    return classes[verdict] || 'verdict-unknown';
  }

  getVerdictIcon(verdict?: string): string {
    const v = verdict || (this.report ? this.report.verdict : '');
    const icons: { [key: string]: string } = {
      'LOW': 'fas fa-check-circle',
      'MID_LOW': 'fas fa-info-circle',
      'MID': 'fas fa-exclamation-triangle',
      'MID_HIGH': 'fas fa-exclamation-triangle',
      'HIGH': 'fas fa-times-circle'
    };
    return icons[v] || 'fas fa-info-circle';
  }

  getVerdictLabel(): string {
    if (!this.report) return '';
    const labels: { [key: string]: string } = {
      'LOW': 'Low Risk',
      'MID_LOW': 'Mid-Low Risk',
      'MID': 'Mid Risk',
      'MID_HIGH': 'Mid-High Risk',
      'HIGH': 'High Risk'
    };
    return labels[this.report.verdict] || this.report.verdict_display || this.report.verdict;
  }

  getFileName(filePath: string): string {
    if (!filePath) return '';
    return filePath.split('/').pop() || filePath;
  }

  goBack(): void {
    this.location.back();
  }

  downloadReport(): void {
    console.log('Download report functionality');
  }

  shareReport(): void {
    console.log('Share report functionality');
  }

  getReportTitle(): string {
    if (!this.report) return '';
    return `${this.report.check_type_display} Analysis Report`;
  }

  getTypeIcon(): string {
    if (!this.report) return 'fas fa-file';
    const icons: { [key: string]: string } = {
      'text_to_text': 'fas fa-font',
      'text_to_file': 'fas fa-file-alt',
      'file_to_file': 'fas fa-copy'
    };
    return icons[this.report.check_type] || 'fas fa-file';
  }

  getTypeLabel(): string {
    if (!this.report) return '';
    return this.report.check_type_display || this.report.check_type;
  }

  getScoreColorClass(score: number): string {
    if (score < 20) return 'score-low';
    if (score < 40) return 'score-mid-low';
    if (score < 60) return 'score-mid';
    if (score < 80) return 'score-mid-high';
    return 'score-high';
  }

  highlightMatches(): void {
    console.log('Highlight matches functionality');
  }

  getSuspiciousWordCount(): number {
    if (!this.report || !this.report.suspicious_text) return 0;
    return this.report.suspicious_text.split(/\s+/).length;
  }

  getSourceWordCount(): number {
    if (!this.report || !this.report.source_text) return 0;
    return this.report.source_text.split(/\s+/).length;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Text copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }

  toggleSegment(index: number): void {
    this.expandedSegments[index] = !this.expandedSegments[index];
  }
}