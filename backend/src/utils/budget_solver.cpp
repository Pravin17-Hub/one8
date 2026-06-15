#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

struct Candidate {
    int index;
    double price;
    double quality;
};

struct Group {
    vector<Candidate> candidates;
};

struct Selection {
    int itemIdx;
    int candidateIdx;
};

int numGroups = 0;
double budgetLimit = 0;
vector<Group> groups;

vector<Selection> bestCombo;
double bestQuality = -1;
int bestCount = 0;
double bestPrice = 0;

void search(int groupIdx, vector<Selection>& currentCombo, double currentPrice, double currentQuality) {
    if (currentPrice > budgetLimit) {
        return;
    }

    int currentCount = currentCombo.size();
    if (currentCount > bestCount || 
        (currentCount == bestCount && currentQuality > bestQuality) || 
        (currentCount == bestCount && currentQuality == bestQuality && currentPrice < bestPrice)) {
        bestCombo = currentCombo;
        bestQuality = currentQuality;
        bestCount = currentCount;
        bestPrice = currentPrice;
    }

    if (groupIdx == numGroups) {
        return;
    }

    const auto& group = groups[groupIdx];

    // Option A: Try each candidate in this group
    for (const auto& cand : group.candidates) {
        currentCombo.push_back({groupIdx, cand.index});
        search(groupIdx + 1, currentCombo, currentPrice + cand.price, currentQuality + cand.quality);
        currentCombo.pop_back(); // Backtrack
    }

    // Option B: Skip this group
    search(groupIdx + 1, currentCombo, currentPrice, currentQuality);
}

int main() {
    // Disable synchronization with C standard streams for faster I/O
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    if (!(cin >> budgetLimit)) return 0;
    if (!(cin >> numGroups)) return 0;

    groups.resize(numGroups);
    for (int i = 0; i < numGroups; ++i) {
        int numCandidates = 0;
        if (!(cin >> numCandidates)) return 0;

        groups[i].candidates.resize(numCandidates);
        for (int j = 0; j < numCandidates; ++j) {
            cin >> groups[i].candidates[j].index 
                >> groups[i].candidates[j].price 
                >> groups[i].candidates[j].quality;
        }
    }

    vector<Selection> currentCombo;
    search(0, currentCombo, 0, 0);

    // Output results:
    // S (number of selected items)
    // S lines of: itemIdx candidateIdx
    // total_price total_quality
    cout << bestCombo.size() << "\n";
    for (const auto& sel : bestCombo) {
        cout << sel.itemIdx << " " << sel.candidateIdx << "\n";
    }
    cout << bestPrice << " " << bestQuality << "\n";

    return 0;
}
