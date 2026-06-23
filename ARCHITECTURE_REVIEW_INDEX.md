# Architecture Review Documentation Index

## Quick Navigation

### For Leadership / Executives
**Read First:** [ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY.md](ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY.md) (10 minutes)

What it covers:
- 3 critical issues in simple terms
- Impact on each domain (PostgreSQL, ML, React, AWS)
- Business implications
- Timeline and effort estimate
- Recommendation to leadership

### For Architecture / Engineering Teams
**Read Next:** [ARCHITECTURE_REVIEW_DETAILED.md](ARCHITECTURE_REVIEW_DETAILED.md) (45 minutes)

What it covers:
- Complete technical analysis with code references
- Evidence from runtime tests
- Root cause analysis
- Priority ranking by impact
- Detailed implementation plan
- Files requiring modification

---

## Document Summary

### ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY.md
- **Audience:** Leadership, Product, Management
- **Length:** 5-10 pages
- **Time to read:** 10 minutes
- **Sections:**
  - The problem (1 sentence)
  - Three critical issues
  - Three high-priority issues
  - Impact summary by domain
  - What needs to happen (phases)
  - Recommendation

### ARCHITECTURE_REVIEW_DETAILED.md
- **Audience:** Architecture team, Senior engineers
- **Length:** 40-50 pages
- **Time to read:** 45 minutes
- **Sections:**
  - Executive summary
  - 8 detailed problem analyses
  - Code references with line numbers
  - Runtime evidence and test results
  - Root cause analysis
  - Severity ratings
  - Priority ranking
  - Implementation plan (80-100 hours)
  - Files requiring modification

---

## Issues Identified (Priority Order)

### 🔴 CRITICAL (Fix Immediately)

**Issue 1:** Topic extraction from H1 (page title) instead of H2 (learning concepts)
- **File:** `curriculum_template_builder.py:182`
- **Code:** `main_topic = heading_path.split(" > ")[0].strip()`
- **Impact:** 100% wrong - all curricula have wrong topics
- **Evidence:** PostgreSQL > Joins returns [PostgreSQL Tutorial] instead of [Joins]
- **Fix effort:** 4 hours
- **Fix complexity:** MEDIUM

**Issue 2:** SQL keywords hard-filtered as noise
- **File:** `topic_cleaner_service.py:179-319`
- **Code:** NOISE_TERMS set includes "SELECT", "JOIN", "INDEX", "VIEW", "TRIGGER"
- **Impact:** 91.7% loss - PostgreSQL curriculum unusable
- **Evidence:** 11/11 SQL concepts filtered
- **Fix effort:** 2 hours
- **Fix complexity:** LOW

**Issue 3:** Concept extraction recall only 50%
- **File:** `firecrawl_service.py:338-376`
- **Code:** Regex patterns for bold, code, capitalized phrases
- **Impact:** 50% loss - half of concepts missing
- **Evidence:** 8/16 ML concepts extracted, 8 missed
- **Fix effort:** 12 hours
- **Fix complexity:** HIGH

### 🟠 HIGH (Fix Before Scaling)

**Issue 4:** Hierarchy flattened from 3 levels to 2 levels
- **File:** `curriculum_template_builder.py:214-280`
- **Impact:** 20-30% - lose specific concept types
- **Evidence:** PostgreSQL > Joins > Inner Join loses third level

**Issue 5:** Hardcoded noise list doesn't scale
- **File:** `topic_cleaner_service.py:22-320`
- **Impact:** 40% - unmaintainable, no domain-specific filtering possible
- **Evidence:** 250+ manual entries, O(n²) complexity

**Issue 6:** No domain-aware curriculum discovery
- **File:** Multiple files
- **Impact:** 30-50% - works by luck for some domains, breaks for SQL
- **Evidence:** Same filtering applied to PostgreSQL, ML, React, AWS

### 🟡 MEDIUM (Fix Before Production)

**Issue 7:** Source quality validation missing
- **File:** `source_ranking_service.py`
- **Impact:** 15-25% - wrong sources selected
- **Evidence:** ML curriculum from MDN (Web domain, not ML)

**Issue 8:** No observability / logging
- **File:** All extraction files
- **Impact:** 30% - cannot debug why topics rejected
- **Evidence:** No per-topic, per-concept, per-source diagnostics

---

## Implementation Roadmap

### Phase 1: Critical Issues (1-2 weeks)
- [ ] Fix topic extraction (H1 → H2)
- [ ] Remove SQL keywords from noise
- [ ] Improve concept extraction (50% → 80%+ recall)
- **Effort:** 18 hours
- **Blocking:** Everything else

### Phase 2: Structural Issues (2-3 weeks)
- [ ] Preserve 3-level hierarchy
- [ ] Implement domain-aware filtering
- [ ] Replace hardcoded list with scoring
- **Effort:** 46 hours
- **Blocking:** Scaling to new domains

### Phase 3: Quality (1 week)
- [ ] Domain-specific source registries
- [ ] Comprehensive observability
- **Effort:** 14 hours
- **Blocking:** Production readiness

**Total:** 80-100 hours over 4 weeks

---

## Key Metrics

### Current State
| Metric | Value | Target | Gap |
|--------|-------|--------|-----|
| Topic accuracy | 0% | 100% | -100% |
| SQL curriculum | 8% | 100% | -92% |
| Concept recall | 50% | 80% | -30% |
| Hierarchy levels | 2 | 3 | -1 |
| Domain aware | NO | YES | CRITICAL |
| Scalability | No | Yes | CRITICAL |

### After Phase 1 (Critical Fixes)
| Metric | Value | Target | Gap |
|--------|-------|--------|-----|
| Topic accuracy | 85% | 100% | -15% |
| SQL curriculum | 80% | 100% | -20% |
| Concept recall | 80% | 85% | -5% |
| Hierarchy levels | 2 | 3 | -1 |
| Domain aware | NO | YES | CRITICAL |
| Scalability | No | Yes | CRITICAL |

### After Phase 2 (Structural)
| Metric | Value | Target | Gap |
|--------|-------|--------|-----|
| Topic accuracy | 90% | 100% | -10% |
| SQL curriculum | 95% | 100% | -5% |
| Concept recall | 82% | 85% | -3% |
| Hierarchy levels | 3 | 3 | 0% ✓ |
| Domain aware | YES | YES | 0% ✓ |
| Scalability | Yes | Yes | 0% ✓ |

### After Phase 3 (Quality)
| Metric | Value | Target | Gap |
|--------|-------|--------|-----|
| Topic accuracy | 95% | 100% | -5% |
| SQL curriculum | 98% | 100% | -2% |
| Concept recall | 85% | 85% | 0% ✓ |
| Hierarchy levels | 3 | 3 | 0% ✓ |
| Domain aware | YES | YES | 0% ✓ |
| Scalability | Yes | Yes | 0% ✓ |
| Observability | YES | YES | 0% ✓ |

---

## Files to Modify

### Phase 1
1. `curriculum_template_builder.py`
   - `_extract_topics()` - Change H1 to H2 extraction

2. `topic_cleaner_service.py`
   - Remove SQL keywords from NOISE_TERMS set

3. `firecrawl_service.py`
   - Improve `TopicExtractor.extract_concepts()`

### Phase 2
4. `curriculum_template_builder.py`
   - Add 3-level hierarchy extraction
   - Replace boolean filtering with scoring

5. `topic_cleaner_service.py`
   - Replace NOISE_TERMS set with scoring function

6. **CREATE NEW:** `domain_config.py`
   - Domain-specific source mappings
   - Domain-specific keyword registries

7. **CREATE NEW:** `domain_aware_filter.py`
   - Relevance scoring function
   - Domain context awareness

### Phase 3
8. **CREATE NEW:** `source_registry.py`
   - Authoritative source mappings by domain

9. **CREATE NEW:** `extraction_logger.py`
   - Track all accept/reject decisions
   - Provide debugging diagnostics

---

## Evidence Appendix

### Test Results
- **Problem 1:** PostgreSQL (7 chunks) → 1 topic (100% wrong)
- **Problem 2:** SQL (12 concepts) → 11 filtered (91.7% loss)
- **Problem 3:** ML (16 expected) → 8 extracted (50% recall)
- **Problem 4:** PostgreSQL > Joins > Inner Join loses Level 3
- **Problem 5:** 250+ manual NOISE_TERMS entries

### Code References
- Issue 1: `curriculum_template_builder.py:182`
- Issue 2: `topic_cleaner_service.py:179-319`
- Issue 3: `firecrawl_service.py:338-376`
- Issue 4: `curriculum_template_builder.py:214-280`
- Issue 5: `topic_cleaner_service.py:22-320`
- Issue 6: All extraction files
- Issue 7: `source_ranking_service.py`
- Issue 8: All extraction files

---

## Stakeholder Communication

### For Product
- Focus on: Domain coverage (SQL broken, others degraded)
- Timeline: 4 weeks to production-ready
- Risk: Using broken system now damages reputation

### For Engineering
- Focus on: Architecture refactoring (not patches)
- Timeline: Phase 1 (1-2 weeks) is critical path
- Risk: Technical debt accumulates if not fixed now

### For Customers
- Focus on: When will SQL curricula be available?
- Timeline: 2 weeks (after Phase 1)
- Risk: Nothing to sell until Phase 1 complete

---

## Recommended Next Steps

1. **Leadership Review** (30 minutes)
   - Read Executive Summary
   - Approve architecture refactoring
   - Allocate 80-100 hours

2. **Architecture Review** (2 hours)
   - Read Detailed Review
   - Validate findings
   - Plan Phase 1 implementation

3. **Engineering Execution** (4 weeks)
   - Phase 1: 1-2 weeks (critical)
   - Phase 2: 2-3 weeks (structural)
   - Phase 3: 1 week (quality)

4. **Quality Assurance** (Ongoing)
   - Test with PostgreSQL, ML, React, AWS
   - Measure improvements against metrics
   - Verify production readiness

---

## Contact / Questions

For questions on this review, refer to:
- **Executive Summary:** Covers business impact and timeline
- **Detailed Review:** Covers technical analysis and implementation
- **Code references:** Exact file:line for each issue

Both documents contain evidence from runtime analysis and code inspection.
