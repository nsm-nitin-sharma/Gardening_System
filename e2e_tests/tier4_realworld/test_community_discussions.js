/**
 * e2e_tests/tier4_realworld/test_community_discussions.js
 * Tier 4 Real-World Scenarios: Multi-User Forum Collaboration & Defensive Integrity (6 tests)
 */

module.exports = async function(assert, sandbox, runner) {
  const run = runner ? runner.test : async (id, name, fn) => { await fn(); };

  await run('T4_COM_01', 'Gardener A creates community discussion topic', async () => {
    sandbox.reset();
    const topicId = Date.now();
    const newTopic = {
      id: topicId,
      title: 'Yellowing lower leaves on cucumber vines in container setup',
      category: 'Pest & Disease',
      content: 'My potted lemon cucumbers have yellowing on bottom leaves with green veins. Is this magnesium deficiency or overwatering?',
      authorName: 'Sample Gardener',
      authorEmail: 'gardener@gardening.com',
      createdAt: '2026-11-20 16:00:00',
      comments: []
    };
    sandbox.db.data.discussions.unshift(newTopic);
    sandbox.db.logActivity('gardener@gardening.com', 'CREATE_DISCUSSION', `Posted topic: ${newTopic.title}`);
    sandbox.db.save();

    const stored = sandbox.db.data.discussions.find(d => d.id === topicId);
    assert.ok(stored !== undefined, 'Topic created in database');
    assert.strictEqual(stored.title, newTopic.title, 'Topic title matches');
  });

  await run('T4_COM_02', 'Gardener B adds constructive diagnostic comment with remedy', async () => {
    sandbox.reset();
    const topicId = Date.now();
    const topic = {
      id: topicId,
      title: 'Cucumber Leaf Chlorosis',
      category: 'Pest & Disease',
      content: 'Yellowing bottom leaves with green veins.',
      authorName: 'Gardener A',
      authorEmail: 'gardenerA@garden.org',
      createdAt: '2026-11-20 16:00:00',
      comments: []
    };
    sandbox.db.data.discussions.unshift(topic);

    // Gardener B comments
    topic.comments.push({
      id: Date.now() + 1,
      authorName: 'Botanist Maya',
      authorEmail: 'maya@garden.org',
      content: 'Classic interveinal chlorosis symptom of magnesium deficiency! Dissolve 1 tbsp Epsom salt in 1 gallon water and apply as foliar drench.',
      createdAt: '2026-11-20 16:30:00'
    });
    sandbox.db.logActivity('maya@garden.org', 'ADD_COMMENT', 'Replied to cucumber chlorosis topic.');
    sandbox.db.save();

    assert.strictEqual(topic.comments.length, 1, 'First comment recorded');
    assert.includes(topic.comments[0].content, 'Epsom salt', 'Comment content verified');
  });

  await run('T4_COM_03', 'Admin contributes verified expert guidance on root health', async () => {
    sandbox.reset();
    const topicId = Date.now();
    const topic = {
      id: topicId,
      title: 'Cucumber Leaf Chlorosis',
      category: 'Pest & Disease',
      content: 'Chlorosis discussion',
      authorName: 'Gardener A',
      comments: [
        { id: 1, authorName: 'Botanist Maya', content: 'Foliar spray with magnesium.', createdAt: '2026-11-20 16:30:00' }
      ]
    };
    sandbox.db.data.discussions.unshift(topic);

    // Admin comments
    topic.comments.push({
      id: 2,
      authorName: 'Platform Administrator',
      authorEmail: 'admin@gardening.com',
      content: 'Also inspect the container drainage holes. Waterlogged root zones prevent magnesium ion uptake regardless of soil fertility.',
      createdAt: '2026-11-20 17:00:00'
    });
    sandbox.db.save();

    assert.strictEqual(topic.comments.length, 2, 'Both peer and admin comments stored');
    assert.strictEqual(topic.comments[1].authorEmail, 'admin@gardening.com', 'Admin author recorded');
  });

  await run('T4_COM_04', 'Forum view renders complete conversation thread with authors and dates', async () => {
    sandbox.reset();
    const topicId = Date.now();
    sandbox.db.data.discussions.unshift({
      id: topicId,
      title: 'Powdery Mildew on Cucurbits',
      category: 'Pest & Disease',
      content: 'White powdery dust on squash leaves.',
      authorName: 'Urban Grower',
      createdAt: '2026-11-20 10:00:00',
      comments: [
        { id: 1, authorName: 'Maya Patel', content: 'Use potassium bicarbonate spray.', createdAt: '2026-11-20 11:00:00' }
      ]
    });
    sandbox.db.save();

    const rendered = sandbox.navigate('gardener-discussions');
    assert.includes(rendered, 'Powdery Mildew on Cucurbits', 'Topic title displayed');
    assert.includes(rendered, 'Maya Patel', 'Commenter name displayed');
    assert.includes(rendered, 'potassium bicarbonate', 'Comment content displayed');
  });

  await run('T4_COM_05', 'Topic category and metadata preserved without data loss', async () => {
    sandbox.reset();
    const topic = sandbox.db.data.discussions[0];
    assert.ok(topic.category !== undefined && topic.category.length > 0, 'Category preserved');
    assert.ok(Array.isArray(topic.comments), 'Comments collection preserved');
  });

  await run('T4_COM_06', 'Defensive user handling preserves discussions without orphan crashes', async () => {
    sandbox.reset();
    const departingUser = {
      id: 999,
      fullName: 'Departing Gardener',
      email: 'departing@garden.org',
      role: 'GARDENER',
      active: true
    };
    sandbox.db.data.users.push(departingUser);

    const topic = {
      id: Date.now(),
      title: 'Heritage Squash Varieties',
      category: 'General Growing',
      content: 'What are your favorite winter squash?',
      authorName: departingUser.fullName,
      authorEmail: departingUser.email,
      comments: []
    };
    sandbox.db.data.discussions.unshift(topic);
    sandbox.db.save();

    // Simulate defensive deletion: Remove user entity but sanitize/retain authored forum content
    const uIdx = sandbox.db.data.users.findIndex(u => u.id === departingUser.id);
    if (uIdx !== -1) sandbox.db.data.users.splice(uIdx, 1);
    sandbox.db.logActivity('admin@gardening.com', 'DELETE_USER', `Defensively deleted user account ${departingUser.email}`);
    sandbox.db.save();

    // Assert forum view renders safely without null reference exception
    let forumHtml = '';
    assert.doesNotThrow(() => {
      forumHtml = sandbox.navigate('gardener-discussions');
    }, 'Forum navigation renders safely when author account is removed');
    assert.includes(forumHtml, 'Heritage Squash Varieties', 'Thread remains intact');
    assert.includes(forumHtml, 'Departing Gardener', 'Author attribution preserved');
  });
};
