import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

interface ComponentScore {
  guid: string;
  component_type: string;
  component_display: string;
  score: number;
  formatted_score: string;
  weight: number;
}

interface AnalysisInsight {
  guid: string;
  insight: string;
  order: number;
}

interface Explanation {
  guid: string;
  explanation: string;
  order: number;
}

interface ScoringDetail {
  guid: string;
  basic_calculation: string;
  enhanced_score: string;
  weights_used: string;
  enhancement: string;
  enhancement_reason: string;
}

interface FileDetail {
  guid: string;
  file: string;
  file_type: string;
  zip_folder: string | null;
}

interface ReportDetail {
  guid: string;
  check_type: string;
  check_type_display: string;
  verdict: string;
  verdict_display: string;
  overall_score: number;
  formatted_score: string;
  is_plagiarized: boolean;
  is_high_risk: boolean;
  confidence: number;
  suspicious_text: string;
  source_text: string;
  processing_time: number;
  notes: string | null;
  created: string;
  modified: string;
  component_scores: ComponentScore[];
  analysis_insights: AnalysisInsight[];
  explanations: Explanation[];
  matching_segments: any[];
  scoring_details: ScoringDetail[];
  suspicious_file_detail: FileDetail | null;
  source_file_detail: FileDetail | null;
}

interface ReportDetailResponse {
  message: string;
  data: ReportDetail;
}

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.component.html',
  styleUrls: ['./report-detail.component.css']
})
export class ReportDetailComponent implements OnInit {
  report: ReportDetail | null = null;
  loading = false;
  error: string | null = null;

  // UI state
  comparisonView: 'side-by-side' | 'unified' = 'side-by-side';
  showTechnicalDetails = false;
  expandedSegments: boolean[] = [];

  // Highlighted text
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

    // Mock data based on real backend structure
    setTimeout(() => {
      const mockResponse: ReportDetailResponse = {
        message: "Report fetched successfully",
        data: {
          guid: reportId,
          check_type: "text_to_file",
          check_type_display: "Text to File",
          verdict: "MID",
          verdict_display: "MID plagiarism risk",
          overall_score: 58.85,
          formatted_score: "58.85%",
          is_plagiarized: true,
          is_high_risk: false,
          confidence: 0.5885,
          suspicious_text: "The Renaissance era represented a time of cultural, artistic, political and economic revival that began in Italy during the 14th century. It signified the shift from medieval times to the early modern period. During the Renaissance, there were developments in linear perspective for painting, progress in anatomical and astronomical studies, and the growth of humanist thinking.",
          source_text: "Artificial Intelligence and Machine Learning\nArtificial intelligence (AI) is intelligence demonstrated by machines,\nas opposed to natural intelligence displayed by humans and animals.\nMachine learning is a subset of AI that focuses on the development of\nalgorithms that can learn and make predictions or decisions based on data.\nThe field has grown rapidly in recent years, with applications in\nhealthcare, finance, transportation, and many other domains.\nDeep learning, a subset of machine learning, has been particularly\nsuccessful in tasks such as image recognition and natural language processing.",
          processing_time: 2.6709494590759277,
          notes: null,
          created: "2025-06-27T09:26:20.060472Z",
          modified: "2025-06-27T09:26:20.060516Z",
          component_scores: [
            {
              guid: "998d2c29-095a-4eab-9069-5dd738bec272",
              component_type: "structural",
              component_display: "Structural Similarity (LSTM1)",
              score: 28.96,
              formatted_score: "28.96%",
              weight: 0.3
            },
            {
              guid: "362699f4-c0fb-4868-ad7e-2e2ac80a9722",
              component_type: "semantic",
              component_display: "Semantic Similarity (LSTM2)",
              score: 100,
              formatted_score: "100.00%",
              weight: 0.3
            },
            {
              guid: "1fd656dc-24ff-4eaf-9c41-1c32104caafc",
              component_type: "meaning",
              component_display: "Meaning Similarity (BERT)",
              score: 78.63,
              formatted_score: "78.63%",
              weight: 0.2
            },
            {
              guid: "f65aa95d-d953-4972-852a-1d57b1460a9e",
              component_type: "exact",
              component_display: "Exact Similarity (TF-IDF)",
              score: 22.21,
              formatted_score: "22.21%",
              weight: 0.2
            },
            {
              guid: "7c72688f-df94-4905-a838-269d37b74bf0",
              component_type: "basic_hybrid",
              component_display: "Basic Hybrid Score",
              score: 58.85,
              formatted_score: "58.85%",
              weight: 1
            }
          ],
          analysis_insights: [
            {
              guid: "52d32f54-e695-41b8-a650-889c4eccac25",
              insight: "Significant similarities found",
              order: 0
            },
            {
              guid: "4396c06d-f9c0-42aa-8877-56ad8b445273",
              insight: "Minimal direct text copying",
              order: 1
            },
            {
              guid: "cd597173-fc92-40a5-9600-ae2c23376e03",
              insight: "Similar ideas expressed differently",
              order: 2
            },
            {
              guid: "cd74d6fb-b6ea-45bb-a989-604f38cbf5ad",
              insight: "Different writing structure",
              order: 3
            }
          ],
          explanations: [
            {
              guid: "5bb5aec7-578e-4202-aa48-4e987da81c8a",
              explanation: "High similarity detected in: Sequential patterns: 100.0%",
              order: 0
            }
          ],
          matching_segments: [],
          scoring_details: [
            {
              guid: "23877f86-60b6-46a2-a8e4-d22e23006b02",
              basic_calculation: "Weighted average: 58.85%",
              enhanced_score: "Enhanced score: 58.85%",
              weights_used: "Structural: 30%, Sequential: 30%, Semantic: 20%, Exact: 20%",
              enhancement: "No enhancement applied",
              enhancement_reason: ""
            }
          ],
          suspicious_file_detail: null,
          source_file_detail: {
            guid: "cae7f208-5b2b-4b3b-ae61-572fa8babd47",
            file: "http://localhost:8000/uploads/sample_pdf.pdf",
            file_type: "pdf",
            zip_folder: null
          }
        }
      };

      this.report = mockResponse.data;
      this.expandedSegments = new Array(this.report.matching_segments?.length || 0).fill(false);
      this.processTextHighlighting();
      this.loading = false;
    }, 500);
  }

  processTextHighlighting(): void {
    if (!this.report) return;

    // For now, just copy the text without highlighting
    // In a real implementation, you'd highlight matching segments
    this.highlightedSuspiciousText = this.report.suspicious_text;
    this.highlightedSourceText = this.report.source_text;
  }

  goBack(): void {
    this.location.back();
  }

  getReportTitle(): string {
    if (!this.report) return '';
    const date = new Date(this.report.created).toLocaleDateString();
    return `${this.report.check_type_display} Report - ${date}`;
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
    return this.report?.check_type_display || '';
  }

  getVerdictIcon(): string {
    if (!this.report) return 'fas fa-info-circle';
    const icons: { [key: string]: string } = {
      'LOW': 'fas fa-check-circle',
      'MID_LOW': 'fas fa-info-circle',
      'MID': 'fas fa-exclamation-triangle',
      'MID_HIGH': 'fas fa-exclamation-triangle',
      'HIGH': 'fas fa-times-circle'
    };
    return icons[this.report.verdict] || 'fas fa-info-circle';
  }

  getVerdictLabel(): string {
    return this.report?.verdict_display || '';
  }

  getComponentName(componentType: string): string {
    const names: { [key: string]: string } = {
      'structural': 'Structural Analysis',
      'semantic': 'Semantic Analysis',
      'meaning': 'Meaning Analysis',
      'exact': 'Exact Match',
      'basic_hybrid': 'Hybrid Score'
    };
    return names[componentType] || componentType;
  }

  toggleSegment(index: number): void {
    this.expandedSegments[index] = !this.expandedSegments[index];
  }

  downloadReport(): void {
    // Implement download functionality
    console.log('Downloading report:', this.report?.guid);
  }

  shareReport(): void {
    // Implement share functionality
    console.log('Sharing report:', this.report?.guid);
  }

  highlightMatches(): void {
    // Toggle text highlighting
    this.processTextHighlighting();
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Text copied to clipboard');
    });
  }

  getSuspiciousWordCount(): number {
    if (!this.report?.suspicious_text) return 0;
    return this.report.suspicious_text.split(/\s+/).filter(word => word.length > 0).length;
  }

  getSourceWordCount(): number {
    if (!this.report?.source_text) return 0;
    return this.report.source_text.split(/\s+/).filter(word => word.length > 0).length;
  }

  getFileName(filePath: string): string {
    if (!filePath) return '';
    return filePath.split('/').pop() || filePath;
  }
}